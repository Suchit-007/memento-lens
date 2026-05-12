export interface AIContextExtraction {
  what: string;
  when: string[];
  where: string[];
  who: string[];
  contextTriggers: string[];
}

export interface MementoItem {
  id: string;
  rawInput: string;
  summary: string;
  createdAt: string; // ISO String timestamp
  status: 'pending' | 'surfaced' | 'archived';
  triggers: {
    when: string[];
    where: string[];
    who: string[];
    activity: string[];
  };
  isRememberThisArchive?: boolean;
  matchReason?: string;
}
