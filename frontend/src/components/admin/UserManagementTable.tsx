import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGetAllUsers, useListApprovals, useSetApproval } from '../../hooks/useQueries';
import { ApprovalStatus } from '../../backend';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function UserManagementTable() {
  const { t } = useLanguage();
  const { data: users = [], isLoading: usersLoading } = useGetAllUsers();
  const { data: approvals = [], isLoading: approvalsLoading } = useListApprovals();
  const setApproval = useSetApproval();

  const isLoading = usersLoading || approvalsLoading;

  const getApprovalStatus = (principal: string) => {
    const approval = approvals.find(a => a.principal.toString() === principal);
    return approval?.status;
  };

  const handleApprove = async (principal: import('@icp-sdk/core/principal').Principal) => {
    await setApproval.mutateAsync({ user: principal, status: ApprovalStatus.approved });
  };

  const handleReject = async (principal: import('@icp-sdk/core/principal').Principal) => {
    await setApproval.mutateAsync({ user: principal, status: ApprovalStatus.rejected });
  };

  if (isLoading) {
    return <div className="flex items-center gap-2 text-muted-foreground py-8"><Loader2 className="w-5 h-5 animate-spin" />{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="font-serif font-bold text-xl text-foreground">{t('admin.users')}</h2>
      <div className="luxury-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Principal ID</TableHead>
              <TableHead className="text-muted-foreground">Bookings</TableHead>
              <TableHead className="text-muted-foreground">Approval Status</TableHead>
              <TableHead className="text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(([principal, bookingCount]) => {
              const principalStr = principal.toString();
              const status = getApprovalStatus(principalStr);
              return (
                <TableRow key={principalStr} className="border-border hover:bg-secondary/50">
                  <TableCell className="font-mono text-xs">{principalStr.slice(0, 20)}...</TableCell>
                  <TableCell>{bookingCount.toString()}</TableCell>
                  <TableCell>
                    {status ? (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        status === ApprovalStatus.approved ? 'bg-green-600/20 text-green-400' :
                        status === ApprovalStatus.rejected ? 'bg-destructive/20 text-destructive' :
                        'bg-yellow-600/20 text-yellow-400'
                      }`}>
                        {String(status)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleApprove(principal)} disabled={setApproval.isPending} className="h-7 text-green-400 hover:text-green-300 text-xs gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />Approve
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleReject(principal)} disabled={setApproval.isPending} className="h-7 text-destructive hover:text-destructive/80 text-xs gap-1">
                        <XCircle className="w-3.5 h-3.5" />Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">No users found.</div>
        )}
      </div>
    </div>
  );
}
