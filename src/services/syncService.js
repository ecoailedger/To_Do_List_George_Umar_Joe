import { supabase, isSupabaseEnabled } from '../config/supabase';
import { loadData as loadLocalData, saveData as saveLocalData } from '../utils/storage';

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.lastSyncTime = null;
    this.syncListeners = [];
    this.workspaceId = null;
    this.realtimeChannel = null;
  }

  // Add sync status listener
  addSyncListener(callback) {
    this.syncListeners.push(callback);
    return () => {
      this.syncListeners = this.syncListeners.filter(cb => cb !== callback);
    };
  }

  // Notify all listeners about sync status
  notifyListeners(status) {
    this.syncListeners.forEach(callback => callback(status));
  }

  // Initialize sync service
  async initialize() {
    if (!isSupabaseEnabled()) {
      console.log('Supabase not configured - running in offline mode');
      return { success: false, offline: true };
    }

    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.log('No active session - running in offline mode');
        return { success: false, offline: true };
      }

      // Load user's workspace
      await this.loadWorkspace();

      // Set up real-time sync
      this.setupRealtimeSync();

      // Perform initial sync
      await this.syncWithCloud();

      return { success: true, offline: false };
    } catch (error) {
      console.error('Failed to initialize sync:', error);
      return { success: false, offline: true, error };
    }
  }

  // Sign in with email (magic link)
  async signInWithEmail(email) {
    if (!isSupabaseEnabled()) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign in with Google OAuth
  async signInWithGoogle() {
    if (!isSupabaseEnabled()) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign out
  async signOut() {
    if (!isSupabaseEnabled()) return;

    try {
      // Unsubscribe from realtime
      if (this.realtimeChannel) {
        await supabase.removeChannel(this.realtimeChannel);
        this.realtimeChannel = null;
      }

      await supabase.auth.signOut();
      this.workspaceId = null;

      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current user
  async getCurrentUser() {
    if (!isSupabaseEnabled()) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // Load or create workspace
  async loadWorkspace() {
    if (!isSupabaseEnabled()) return;

    try {
      const user = await this.getCurrentUser();
      if (!user) return;

      // Try to find user's workspace
      const { data: workspaces, error: fetchError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user.id)
        .limit(1);

      if (fetchError) throw fetchError;

      if (workspaces && workspaces.length > 0) {
        this.workspaceId = workspaces[0].id;
      } else {
        // Create new workspace
        const { data: newWorkspace, error: createError } = await supabase
          .from('workspaces')
          .insert([
            {
              name: `${user.email}'s Workspace`,
              owner_id: user.id,
            },
          ])
          .select()
          .single();

        if (createError) throw createError;

        this.workspaceId = newWorkspace.id;

        // Add user as workspace member
        await supabase.from('workspace_members').insert([
          {
            workspace_id: newWorkspace.id,
            user_id: user.id,
            role: 'owner',
          },
        ]);
      }
    } catch (error) {
      console.error('Workspace load error:', error);
    }
  }

  // Sync local data with cloud
  async syncWithCloud(direction = 'bidirectional') {
    if (!isSupabaseEnabled() || !this.workspaceId || this.isSyncing) {
      return { success: false, error: 'Cannot sync' };
    }

    this.isSyncing = true;
    this.notifyListeners({ status: 'syncing' });

    try {
      const localData = loadLocalData();
      const user = await this.getCurrentUser();

      if (direction === 'upload' || direction === 'bidirectional') {
        // Upload local data to cloud
        const { data: existingData, error: fetchError } = await supabase
          .from('todo_data')
          .select('*')
          .eq('workspace_id', this.workspaceId)
          .eq('user_id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        if (existingData) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('todo_data')
            .update({
              data: localData,
              version: existingData.version + 1,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingData.id);

          if (updateError) throw updateError;
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from('todo_data')
            .insert([
              {
                workspace_id: this.workspaceId,
                user_id: user.id,
                data: localData,
                version: 1,
              },
            ]);

          if (insertError) throw insertError;
        }
      }

      if (direction === 'download' || direction === 'bidirectional') {
        // Download cloud data
        const { data: cloudData, error: downloadError } = await supabase
          .from('todo_data')
          .select('*')
          .eq('workspace_id', this.workspaceId)
          .eq('user_id', user.id)
          .single();

        if (downloadError && downloadError.code !== 'PGRST116') {
          throw downloadError;
        }

        if (cloudData && cloudData.data) {
          // Merge or replace local data based on timestamps
          const localTimestamp = new Date(localData.lastSaved || 0);
          const cloudTimestamp = new Date(cloudData.updated_at);

          if (cloudTimestamp > localTimestamp) {
            saveLocalData(cloudData.data);
          }
        }
      }

      this.lastSyncTime = new Date();
      this.notifyListeners({ status: 'synced', lastSync: this.lastSyncTime });

      return { success: true };
    } catch (error) {
      console.error('Sync error:', error);
      this.notifyListeners({ status: 'error', error: error.message });
      return { success: false, error: error.message };
    } finally {
      this.isSyncing = false;
    }
  }

  // Set up real-time sync
  setupRealtimeSync() {
    if (!isSupabaseEnabled() || !this.workspaceId) return;

    // Subscribe to changes in todo_data table
    this.realtimeChannel = supabase
      .channel('todo-data-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todo_data',
          filter: `workspace_id=eq.${this.workspaceId}`,
        },
        async (payload) => {
          console.log('Realtime update received:', payload);

          // Only sync down if the change was from another device/user
          const user = await this.getCurrentUser();
          if (payload.new && payload.new.user_id !== user.id) {
            this.notifyListeners({ status: 'incoming' });
            await this.syncWithCloud('download');
          }
        }
      )
      .subscribe();
  }

  // Manual sync trigger
  async manualSync() {
    return await this.syncWithCloud('bidirectional');
  }
}

// Export singleton instance
export const syncService = new SyncService();
