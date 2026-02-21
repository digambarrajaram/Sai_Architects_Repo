/**
 * CivManager - Audit Log Service
 * Mock data and async simulation for audit logs
 * NO backend logic - frontend only
 */

import { AuditLog, AuditAction, AuditEntityType } from '../types';

// =====================================================
// MOCK DATA
// =====================================================

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    projectId: 'proj-001',
    userId: 'user-001',
    userName: 'John Owner',
    action: AuditAction.CREATE,
    entity_type: AuditEntityType.EXPENSE,
    entityId: 'exp-001',
    details: 'Created expense: Steel reinforcement bars - 50 tons (₹150,000)',
    timestamp: '2024-06-15T10:30:00Z',
    ipAddress: '192.168.1.100',
  },
  {
    id: 'log-002',
    projectId: 'proj-001',
    userId: 'user-002',
    userName: 'Mike Supervisor',
    action: AuditAction.CREATE,
    entity_type: AuditEntityType.EXPENSE,
    entityId: 'exp-002',
    details: 'Created expense: Concrete mixer rental - 2 weeks (₹85,000)',
    timestamp: '2024-06-10T09:00:00Z',
    ipAddress: '192.168.1.101',
  },
  {
    id: 'log-003',
    projectId: 'proj-001',
    userId: 'user-001',
    userName: 'John Owner',
    action: AuditAction.UPDATE,
    entity_type: AuditEntityType.PROJECT,
    entityId: 'proj-001',
    details: 'Updated project budget from ₹4,500,000 to ₹5,000,000',
    timestamp: '2024-06-08T14:00:00Z',
    ipAddress: '192.168.1.100',
  },
  {
    id: 'log-004',
    projectId: 'proj-001',
    userId: 'user-001',
    userName: 'John Owner',
    action: AuditAction.EXPORT,
    entity_type: AuditEntityType.REPORT,
    entityId: 'report-001',
    details: 'Exported monthly expense report as PDF',
    timestamp: '2024-06-05T16:30:00Z',
    ipAddress: '192.168.1.100',
  },
  {
    id: 'log-005',
    projectId: 'proj-001',
    userId: 'user-002',
    userName: 'Mike Supervisor',
    action: AuditAction.VIEW,
    entity_type: AuditEntityType.PROJECT,
    entityId: 'proj-001',
    details: 'Viewed project details',
    timestamp: '2024-06-04T11:00:00Z',
    ipAddress: '192.168.1.101',
  },
  {
    id: 'log-006',
    projectId: 'proj-002',
    userId: 'user-003',
    userName: 'Sarah Supervisor',
    action: AuditAction.CREATE,
    entity_type: AuditEntityType.EXPENSE,
    entityId: 'exp-005',
    details: 'Created expense: Foundation excavation work (₹200,000)',
    timestamp: '2024-06-08T11:00:00Z',
    ipAddress: '192.168.1.102',
  },
  {
    id: 'log-007',
    projectId: 'proj-002',
    userId: 'user-001',
    userName: 'John Owner',
    action: AuditAction.DELETE,
    entity_type: AuditEntityType.EXPENSE,
    entityId: 'exp-deleted',
    details: 'Deleted expense: Duplicate entry (₹10,000)',
    timestamp: '2024-06-02T09:30:00Z',
    ipAddress: '192.168.1.100',
  },
  {
    id: 'log-008',
    projectId: 'proj-005',
    userId: 'user-004',
    userName: 'David Supervisor',
    action: AuditAction.CREATE,
    entity_type: AuditEntityType.EXPENSE,
    entityId: 'exp-008',
    details: 'Created expense: Tunnel boring machine rental (₹500,000)',
    timestamp: '2024-06-18T08:00:00Z',
    ipAddress: '192.168.1.103',
  },
];

// =====================================================
// ASYNC SIMULATION HELPER
// =====================================================

const simulateDelay = (ms: number = 500): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

// =====================================================
// AUDIT LOG SERVICE
// =====================================================

export const auditLogService = {
  /**
   * Get audit logs for a project
   */
  async getAuditLogsByProject(
    projectId: string,
    options?: {
      page?: number;
      pageSize?: number;
      action?: AuditAction;
      entity_type?: AuditEntityType;
    }
  ): Promise<{ logs: AuditLog[]; total: number; hasMore: boolean }> {
    await simulateDelay(600);
    
    let logs = MOCK_AUDIT_LOGS.filter(log => log.projectId === projectId);
    
    // Filter by action if specified
    if (options?.action) {
      logs = logs.filter(log => log.action === options.action);
    }
    
    // Filter by entity type if specified
    if (options?.entity_type) {
      logs = logs.filter(log => log.entity_type === options.entity_type);
    }
    
    // Sort by timestamp descending
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    const total = logs.length;
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 20;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    const paginatedLogs = logs.slice(startIndex, endIndex);
    
    return {
      logs: paginatedLogs,
      total,
      hasMore: endIndex < total,
    };
  },

  /**
   * Get audit log by ID
   */
  async getAuditLogById(logId: string): Promise<AuditLog> {
    await simulateDelay(300);
    const log = MOCK_AUDIT_LOGS.find(l => l.id === logId);
    if (!log) {
      throw new Error(`Audit log not found: ${logId}`);
    }
    return { ...log };
  },

  /**
   * Get recent activity for a project
   */
  async getRecentActivity(projectId: string, limit: number = 5): Promise<AuditLog[]> {
    await simulateDelay(400);
    return MOCK_AUDIT_LOGS
      .filter(log => log.projectId === projectId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  },

  /**
   * Get activity by user
   */
  async getActivityByUser(userId: string): Promise<AuditLog[]> {
    await simulateDelay(500);
    return MOCK_AUDIT_LOGS
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  /**
   * Log an action (mock - would send to backend in real app)
   */
  async logAction(
    action: Omit<AuditLog, 'id' | 'timestamp'>
  ): Promise<AuditLog> {
    await simulateDelay(200);
    const newLog: AuditLog = {
      ...action,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    MOCK_AUDIT_LOGS.unshift(newLog);
    return newLog;
  },

  /**
   * Get available action types for filtering
   */
  getActionTypes(): Array<{ value: AuditAction; label: string }> {
    return [
      { value: AuditAction.CREATE, label: 'Created' },
      { value: AuditAction.UPDATE, label: 'Updated' },
      { value: AuditAction.DELETE, label: 'Deleted' },
      { value: AuditAction.VIEW, label: 'Viewed' },
      { value: AuditAction.EXPORT, label: 'Exported' },
    ];
  },

  /**
   * Get available entity types for filtering
   */
  getEntityTypes(): Array<{ value: AuditEntityType; label: string }> {
    return [
      { value: AuditEntityType.PROJECT, label: 'Project' },
      { value: AuditEntityType.EXPENSE, label: 'Expense' },
      { value: AuditEntityType.USER, label: 'User' },
      { value: AuditEntityType.REPORT, label: 'Report' },
    ];
  },
};

export default auditLogService;
