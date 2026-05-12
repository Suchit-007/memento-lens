export interface MementoItem {
  id: string;
  rawInput: string;
  summary: string;           // Derived by AI ("what" or concise reduction)
  createdAt: string;         // ISO String timestamp
  status: 'pending' | 'surfaced' | 'archived';
  triggers: {
    when: string[];          // Temporal tags
    where: string[];         // Spatial/location tags
    who: string[];           // Social/companion tags
    activity: string[];      // Contextual state tags
  };
  isRememberThisArchive?: boolean; // Flag distinguishing standard tasks from long-form summaries
}
