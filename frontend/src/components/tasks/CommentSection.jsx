import { useState, useEffect, useRef } from 'react';
import { Send, Edit2, Trash2, Loader2, MessageCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import * as taskApi from '../../api/task.api';
import Avatar from '../common/Avatar';
import { formatSmartDate } from '../../utils/formatters';
import useSocket from '../../hooks/useSocket';
import toast from 'react-hot-toast';

export default function CommentSection({ taskId }) {
  const { user }  = useSelector((s) => s.auth);
  const { socket, emitTyping, emitStopTyping } = useSocket() || {};
  const [comments,  setComments]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [content,   setContent]   = useState('');
  const [submitting,setSubmitting]= useState(false);
  const [editing,   setEditing]   = useState(null); // commentId
  const [editText,  setEditText]  = useState('');
  const [typingName,setTypingName]= useState('');
  const typingTimer = useRef(null);

  useEffect(() => {
    loadComments();

    if (socket) {
      socket.on('comment:typing', ({ userName }) => {
        setTypingName(userName);
      });
      socket.on('comment:stop-typing', () => {
        setTypingName('');
      });
    }

    return () => {
      if (socket) {
        socket.off('comment:typing');
        socket.off('comment:stop-typing');
      }
    };
  }, [taskId, socket]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const res = await taskApi.getComments(taskId);
      setComments(res.data || []);
    } catch { toast.error('Failed to load comments'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const res = await taskApi.addComment(taskId, { content: content.trim() });
      setComments((c) => [...c, res.data]);
      setContent('');
      emitStopTyping?.(taskId);
    } catch { toast.error('Failed to add comment'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (commentId) => {
    try {
      await taskApi.deleteComment(taskId, commentId);
      setComments((c) => c.filter((cm) => cm._id !== commentId));
      toast.success('Comment deleted');
    } catch { toast.error('Failed to delete comment'); }
  };

  const handleEdit = async (commentId) => {
    if (!editText.trim()) return;
    try {
      const res = await taskApi.updateComment(taskId, commentId, { content: editText.trim() });
      setComments((c) => c.map((cm) => cm._id === commentId ? res.data : cm));
      setEditing(null);
      toast.success('Comment updated');
    } catch { toast.error('Failed to update comment'); }
  };

  const handleTyping = (val) => {
    setContent(val);
    clearTimeout(typingTimer.current);
    if (val) {
      emitTyping?.(taskId, user?.name);
      typingTimer.current = setTimeout(() => emitStopTyping?.(taskId), 1500);
    } else {
      emitStopTyping?.(taskId);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold flex items-center gap-2" style={{ color: 'var(--c-text-1)' }}>
        <MessageCircle size={16} style={{ color: 'var(--c-accent)' }} />
        Comments
        {comments.length > 0 && (
          <span className="text-xs font-normal" style={{ color: 'var(--c-text-3)' }}>({comments.length})</span>
        )}
      </h4>

      {/* Comment list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="skeleton w-8 h-8 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-24 rounded" />
                <div className="skeleton h-16 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm py-3" style={{ color: 'var(--c-text-3)' }}>No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((cm) => {
            const isOwner = cm.author?._id === user?._id || cm.author === user?._id;
            return (
              <div key={cm._id} className="flex gap-3 group animate-fade-in">
                <Avatar name={cm.author?.name} src={cm.author?.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold" style={{ color: 'var(--c-text-1)' }}>{cm.author?.name}</span>
                    <span className="text-xs" style={{ color: 'var(--c-text-3)' }}>{formatSmartDate(cm.createdAt)}</span>
                    {cm.isEdited && <span className="text-xs italic" style={{ color: 'var(--c-text-3)' }}>(edited)</span>}
                  </div>
                  {editing === cm._id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={3}
                        className="input resize-none text-sm"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(cm._id)} className="btn-primary btn-sm">Save</button>
                        <button onClick={() => setEditing(null)} className="btn-secondary btn-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl px-4 py-3" style={{ background: 'var(--c-bg)', border: '1px solid var(--c-border)' }}>
                      <p className="text-sm whitespace-pre-wrap break-words" style={{ color: 'var(--c-text-2)' }}>{cm.content}</p>
                    </div>
                  )}
                </div>
                {/* Actions */}
                {(isOwner || user?.role === 'admin') && editing !== cm._id && (
                  <div className="flex items-start gap-1 pt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isOwner && (
                      <button onClick={() => { setEditing(cm._id); setEditText(cm.content); }}
                        className="btn-ghost p-1" style={{ color: 'var(--c-text-3)' }} title="Edit">
                        <Edit2 size={13} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(cm._id)}
                      className="btn-ghost p-1" style={{ color: 'var(--c-text-3)' }} title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Typing indicator */}
      {typingName && (
        <p className="text-xs italic" style={{ color: 'var(--c-text-3)' }}>{typingName} is typing…</p>
      )}

      {/* New comment form */}
      <form onSubmit={handleSubmit} className="flex gap-3 pt-2">
        <Avatar name={user?.name} src={user?.avatar} size="sm" />
        <div className="flex-1 flex gap-2">
          <input
            value={content}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Add a comment…"
            className="input flex-1 text-sm"
            disabled={submitting}
          />
          <button type="submit" disabled={submitting || !content.trim()} className="btn-primary px-3">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </form>
    </div>
  );
}
