import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import Card from '../components/ui/card';
import Input from '../components/ui/input';
import Button from '../components/ui/button';
import { 
  Key, 
  Copy, 
  Check, 
  Edit2, 
  Trash2, 
  Search, 
  AlertTriangle, 
  Plus, 
  X, 
  AlertCircle,
  Clock
} from 'lucide-react';

export default function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Toast Notification State
  const [toasts, setToasts] = useState([]);

  // Modal Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [newKeyName, setNewKeyName] = useState('');
  const [createdKeyData, setCreatedKeyData] = useState(null); // Holds raw generated key on success

  const [selectedKey, setSelectedKey] = useState(null); // Selected for rename/delete
  const [renameValue, setRenameValue] = useState('');

  // Copy tracking state
  const [copiedKeyId, setCopiedKeyId] = useState(null);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const fetchKeys = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/keys');
      setKeys(response.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load API keys. Please try again later.');
      showToast('Failed to load API keys', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'API Keys | Village API';
    fetchKeys();
  }, []);

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const response = await apiClient.post('/keys', { name: newKeyName });
      const createdKey = response.data.data;
      setKeys((prev) => [createdKey, ...prev]);
      setCreatedKeyData(createdKey); // Save full key to show once
      setNewKeyName('');
      showToast('API Key created successfully');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to create API key', 'error');
    }
  };

  const handleRenameKey = async (e) => {
    e.preventDefault();
    if (!renameValue.trim() || !selectedKey) return;

    try {
      const response = await apiClient.patch(`/keys/${selectedKey.id}`, { name: renameValue });
      const updated = response.data.data;
      setKeys((prev) => prev.map((k) => (k.id === selectedKey.id ? { ...k, name: updated.name } : k)));
      setIsRenameOpen(false);
      setSelectedKey(null);
      setRenameValue('');
      showToast('API Key renamed successfully');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to rename API key', 'error');
    }
  };

  const handleToggleStatus = async (keyItem) => {
    const nextStatus = !keyItem.isActive;
    try {
      await apiClient.patch(`/keys/${keyItem.id}`, { isActive: nextStatus });
      setKeys((prev) => prev.map((k) => (k.id === keyItem.id ? { ...k, isActive: nextStatus } : k)));
      showToast(`API Key ${nextStatus ? 'enabled' : 'disabled'} successfully`);
    } catch (err) {
      console.error(err);
      showToast('Failed to toggle API Key status', 'error');
    }
  };

  const handleDeleteKey = async () => {
    if (!selectedKey) return;
    try {
      await apiClient.delete(`/keys/${selectedKey.id}`);
      setKeys((prev) => prev.filter((k) => k.id !== selectedKey.id));
      setIsDeleteOpen(false);
      setSelectedKey(null);
      showToast('API Key revoked successfully');
    } catch (err) {
      console.error(err);
      showToast('Failed to revoke API key', 'error');
    }
  };

  const handleCopy = (text, keyId) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(keyId);
    showToast('Copied key to clipboard');
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  // Mask string helper
  const maskKeyString = (rawKey) => {
    if (!rawKey) return '';
    if (rawKey.length <= 8) return '••••••••';
    const prefix = rawKey.substring(0, 4); // "vap_"
    const suffix = rawKey.substring(rawKey.length - 4);
    return `${prefix}••••••••••••••••${suffix}`;
  };

  // Filter keys by search input
  const filteredKeys = keys.filter((k) =>
    k.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 select-none font-sans pb-6 relative">
      {/* Title Header */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">API Keys</h1>
          <p className="text-xs text-text-secondary mt-1 leading-normal max-w-sm sm:max-w-md">
            Generate and manage secure credentials for querying Village API services.
          </p>
        </div>
        <button 
          onClick={() => {
            setCreatedKeyData(null);
            setIsCreateOpen(true);
          }} 
          className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 active:scale-[0.98] hover:-translate-y-[0.5px] rounded-lg shadow-md hover:shadow-primary-500/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 shrink-0 select-none"
        >
          <Plus size={14} />
          <span>Create API Key</span>
        </button>
      </div>

      {/* Search Input (Polished to max-w-xs) */}
      <div className="relative max-w-xs w-full">
        <span className="absolute inset-y-0 left-3 flex items-center text-text-muted">
          <Search size={14} />
        </span>
        <input
          type="text"
          placeholder="Search keys by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-background-card border border-border rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
        />
      </div>

      {/* Main Content Area */}
      {loading ? (
        <Card className="p-6 animate-pulse space-y-6 shadow-lg border border-border/80">
          <div className="h-4 bg-border rounded w-1/5"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center py-2.5 border-b border-border/30 last:border-0">
                <div className="h-4 bg-border rounded w-1/3"></div>
                <div className="h-4 bg-border rounded w-1/4"></div>
                <div className="h-4 bg-border rounded w-1/12"></div>
              </div>
            ))}
          </div>
        </Card>
      ) : error ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center px-4">
          <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4 shadow-lg shadow-red-500/5">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-base font-bold text-text-primary">Failed to load API keys</h3>
          <p className="text-text-secondary mt-1.5 max-w-sm text-xs leading-normal">{error}</p>
          <Button onClick={fetchKeys} className="mt-6 w-auto px-6">
            Retry
          </Button>
        </div>
      ) : filteredKeys.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-10 px-6 border border-dashed border-border/80 rounded-xl bg-background-card/40 min-h-[220px]">
          <div className="h-9 w-9 rounded-lg bg-primary-950/60 border border-primary-500/20 flex items-center justify-center text-primary-400 mb-3.5 shadow-lg shadow-primary-500/5">
            <Key size={15} />
          </div>
          <h3 className="text-xs font-bold text-text-primary tracking-wide uppercase">
            {searchQuery ? 'No matching keys' : 'No API Keys'}
          </h3>
          <p className="text-[11px] text-text-muted mt-1.5 max-w-xs leading-normal font-medium">
            {searchQuery 
              ? 'Refine your query or check for spelling errors.' 
              : 'Create your first credential key to begin authorized queries.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-5 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 active:scale-[0.98] rounded-lg shadow-md transition-all duration-200 focus:outline-none"
            >
              Generate Key
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto border border-border/80 rounded-xl bg-background-card/40 shadow-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/60 text-text-secondary font-bold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Key String</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Created Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-text-secondary">
              {filteredKeys.map((keyItem) => (
                <tr key={keyItem.id} className="hover:bg-primary-500/[0.01] transition-colors duration-150">
                  <td className="px-6 py-4 font-semibold text-text-primary">
                    {keyItem.name}
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] text-text-secondary select-all">
                    {maskKeyString(keyItem.key)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(keyItem)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        keyItem.isActive ? 'bg-primary-500' : 'bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          keyItem.isActive ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 font-medium flex items-center gap-1.5 mt-0.5">
                    <Clock size={12} className="text-text-muted" />
                    <span>{new Date(keyItem.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopy(keyItem.key, keyItem.id)}
                        className="p-1.5 rounded bg-background hover:bg-background-popover border border-border/80 text-text-secondary hover:text-text-primary transition-all duration-200"
                        title="Copy API Key"
                      >
                        {copiedKeyId === keyItem.id ? (
                          <Check size={13} className="text-emerald-400" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>

                      {/* Rename Button */}
                      <button
                        onClick={() => {
                          setSelectedKey(keyItem);
                          setRenameValue(keyItem.name);
                          setIsRenameOpen(true);
                        }}
                        className="p-1.5 rounded bg-background hover:bg-background-popover border border-border/80 text-text-secondary hover:text-text-primary transition-all duration-200"
                        title="Rename Key"
                      >
                        <Edit2 size={13} />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => {
                          setSelectedKey(keyItem);
                          setIsDeleteOpen(true);
                        }}
                        className="p-1.5 rounded bg-background hover:bg-red-500/5 border border-border/80 hover:border-red-500/20 text-text-secondary hover:text-red-400 transition-all duration-200"
                        title="Revoke Key"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE API KEY MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCreateOpen(false)} className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
          <div className="relative bg-gradient-to-br from-background-card to-[#121214] border border-border rounded-xl max-w-md w-full p-6 shadow-2xl z-10 transition-all">
            <div className="flex items-center justify-between mb-4 border-b border-border/80 pb-3">
              <h3 className="text-sm font-bold text-text-primary tracking-wide uppercase">Create API Key</h3>
              <button 
                onClick={() => setIsCreateOpen(false)} 
                className="text-text-secondary hover:text-text-primary p-1 rounded-md hover:bg-background"
              >
                <X size={15} />
              </button>
            </div>

            {createdKeyData ? (
              <div className="space-y-4">
                <div className="p-3 bg-primary-500/10 border border-primary-500/25 rounded-lg text-xs text-primary-400 flex items-start gap-2.5">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Warning: Key only shown once!</span>
                    <span>For security purposes, you will not be able to view this credentials key string again. Please store it securely.</span>
                  </div>
                </div>

                <div className="relative bg-background border border-border rounded-lg p-3 pr-10 font-mono text-[11px] text-primary-400 select-all overflow-x-auto">
                  {createdKeyData.key}
                  <button
                    onClick={() => handleCopy(createdKeyData.key, 'new')}
                    className="absolute right-2 top-2 p-1.5 rounded bg-background-card border border-border text-text-secondary hover:text-text-primary transition-all duration-150"
                  >
                    {copiedKeyId === 'new' ? (
                      <Check size={12} className="text-emerald-400" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>

                <Button onClick={() => setIsCreateOpen(false)} className="w-full mt-2">
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCreateKey} className="space-y-4">
                <Input
                  label="API Key Name"
                  id="keyName"
                  placeholder="e.g. Production Service"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full mt-2">
                  Generate Key
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* RENAME MODAL */}
      {isRenameOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsRenameOpen(false)} className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
          <div className="relative bg-gradient-to-br from-background-card to-[#121214] border border-border rounded-xl max-w-md w-full p-6 shadow-2xl z-10">
            <div className="flex items-center justify-between mb-4 border-b border-border/80 pb-3">
              <h3 className="text-sm font-bold text-text-primary tracking-wide uppercase">Rename API Key</h3>
              <button 
                onClick={() => setIsRenameOpen(false)} 
                className="text-text-secondary hover:text-text-primary p-1 rounded-md hover:bg-background"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleRenameKey} className="space-y-4">
              <Input
                label="New Name"
                id="renameVal"
                placeholder="e.g. Integration Node"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                required
              />
              <Button type="submit" className="w-full mt-2">
                Save
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsDeleteOpen(false)} className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
          <div className="relative bg-gradient-to-br from-background-card to-[#121214] border border-border rounded-xl max-sm w-full p-6 shadow-2xl z-10">
            <div className="flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4 shadow-lg shadow-red-500/5">
                <AlertTriangle size={18} />
              </div>
              <h3 className="text-sm font-bold text-text-primary tracking-wide uppercase">Revoke API Key</h3>
              <p className="text-xs text-text-secondary mt-2.5 leading-relaxed font-medium">
                Are you sure you want to delete <span className="font-semibold text-text-primary">"{selectedKey?.name}"</span>? Any client applications currently querying the system with this key will immediately fail authorization calls.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <Button 
                onClick={() => setIsDeleteOpen(false)} 
                className="flex-1 bg-gradient-to-br from-background-card to-[#1c1c1e] hover:from-[#1c1c1e] hover:to-[#242426] border border-border text-text-primary"
              >
                Cancel
              </Button>
              <button
                onClick={handleDeleteKey}
                className="flex-1 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-500 active:scale-[0.98] transition-all rounded-lg shadow-md focus:outline-none"
              >
                Revoke Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM TOAST SYSTEM OVERLAYS */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`px-4 py-3 rounded-lg shadow-xl border text-[11px] font-bold uppercase tracking-wider flex items-center gap-2.5 animate-scale-up select-none transition-all duration-300 ${
              toast.type === 'error' 
                ? 'bg-red-950/70 border-red-500/35 text-red-400 shadow-red-900/5' 
                : 'bg-emerald-950/70 border-emerald-500/35 text-emerald-400 shadow-emerald-900/5'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle size={14} /> : <Check size={14} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
