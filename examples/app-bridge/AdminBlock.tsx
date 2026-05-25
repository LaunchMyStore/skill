/**
 * Minimal admin_block iframe source using @launchmystore/app-bridge-react.
 * Renders a button that opens the resource picker, then toasts the count
 * of selected products + sends an authenticated call to the app server.
 */
import React from 'react';
import {
  AppBridgeProvider,
  useToast,
  useResourcePicker,
  useSessionToken,
} from '@launchmystore/app-bridge-react';

const apiKey = import.meta.env.VITE_LMS_API_KEY as string;
const host = new URLSearchParams(window.location.search).get('host') || '';

function Inner() {
  const toast = useToast();
  const picker = useResourcePicker();
  const getSessionToken = useSessionToken();

  async function handleClick() {
    const { selection } = await picker.open({
      type: 'product',
      multiple: true,
    });
    if (!selection?.length) return;

    const token = await getSessionToken();
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productIds: selection.map((p) => p.id) }),
    });

    if (res.ok) {
      toast.show({ message: `Synced ${selection.length} products` });
    } else {
      toast.show({ message: 'Sync failed', isError: true });
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Product Sync</h2>
      <button onClick={handleClick} style={{ padding: '8px 16px' }}>
        Pick products to sync
      </button>
    </div>
  );
}

export default function AdminBlock() {
  return (
    <AppBridgeProvider apiKey={apiKey} host={host}>
      <Inner />
    </AppBridgeProvider>
  );
}
