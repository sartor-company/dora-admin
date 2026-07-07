import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ModalId } from '../types';
import type { ApiProduct } from '../types/api';
import type { ApiTeamMember } from '../types/api';

export interface EditMemberPayload {
  member: ApiTeamMember;
}

export interface FlagBatchPayload {
  batchId: string;
  batchNumber: string;
  productName?: string;
  doraScore?: number;
}

export interface ReplenishGiftPayload {
  campaignId: string;
  poolId: string;
  giftId: string;
  giftName: string;
  poolName: string;
  remaining: number;
}

export interface AddGiftPayload {
  campaignId: string;
  poolId: string;
  poolName: string;
}

export interface ProductModalPayload {
  mode: 'edit';
  product: ApiProduct;
}

export type ModalPayload =
  | FlagBatchPayload
  | ReplenishGiftPayload
  | AddGiftPayload
  | ProductModalPayload
  | EditMemberPayload;

interface ModalContextValue {
  openModal: (id: ModalId, payload?: ModalPayload) => void;
  closeModal: (id: ModalId) => void;
  isOpen: (id: ModalId) => boolean;
  closeAll: () => void;
  getPayload: <T extends ModalPayload>(id: ModalId) => T | undefined;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<Set<ModalId>>(new Set());
  const [payloads, setPayloads] = useState<Partial<Record<ModalId, ModalPayload>>>({});

  const openModal = useCallback((id: ModalId, payload?: ModalPayload) => {
    setOpen((prev) => new Set(prev).add(id));
    if (payload) setPayloads((p) => ({ ...p, [id]: payload }));
  }, []);

  const closeModal = useCallback((id: ModalId) => {
    setOpen((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setPayloads((p) => {
      const next = { ...p };
      delete next[id];
      return next;
    });
  }, []);

  const isOpen = useCallback((id: ModalId) => open.has(id), [open]);

  const closeAll = useCallback(() => {
    setOpen(new Set());
    setPayloads({});
  }, []);

  const getPayload = useCallback(
    <T extends ModalPayload>(id: ModalId) => payloads[id] as T | undefined,
    [payloads],
  );

  const value = useMemo(
    () => ({ openModal, closeModal, isOpen, closeAll, getPayload }),
    [openModal, closeModal, isOpen, closeAll, getPayload],
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}
