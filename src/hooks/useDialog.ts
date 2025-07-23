import { useState, useCallback } from 'react';

export interface DialogState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export const useDialog = () => {
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showDialog = useCallback((options: Omit<DialogState, 'isOpen'>) => {
    setDialog({
      ...options,
      isOpen: true
    });
  }, []);

  const hideDialog = useCallback(() => {
    setDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showInfo = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showDialog({
      title,
      message,
      type: 'info',
      onConfirm
    });
  }, [showDialog]);

  const showSuccess = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showDialog({
      title,
      message,
      type: 'success',
      onConfirm
    });
  }, [showDialog]);

  const showWarning = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showDialog({
      title,
      message,
      type: 'warning',
      onConfirm
    });
  }, [showDialog]);

  const showError = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showDialog({
      title,
      message,
      type: 'error',
      onConfirm
    });
  }, [showDialog]);

  const showConfirm = useCallback((
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void,
    confirmText = 'Aceptar',
    cancelText = 'Cancelar'
  ) => {
    showDialog({
      title,
      message,
      type: 'warning',
      confirmText,
      cancelText,
      onConfirm,
      onCancel,
      showCancel: true
    });
  }, [showDialog]);

  return {
    dialog,
    showDialog,
    hideDialog,
    showInfo,
    showSuccess,
    showWarning,
    showError,
    showConfirm
  };
};