import React, { useState } from 'react';
import { useOverlayStore, type Widget } from '../../store/overlayStore';
import { 
  Eye, EyeOff, Lock, Unlock, Trash2, Copy, 
  Layers, FolderOpen, FolderClosed, Group, ArrowUp, ArrowDown, Edit3 
} from 'lucide-react';

export const LayerPanel: React.FC = () => {
  const activeScene = useOverlayStore(s => s.currentScene);
  const selectedWidgetIds = useOverlayStore(s => s.selectedWidgetIds);
  const widgets = useOverlayStore(s => s.sceneWidgets[activeScene] || []);
  
  const updateWidget = useOverlayStore(s => s.updateWidget);
  const removeWidget = useOverlayStore(s => s.removeWidget);
  const duplicateWidget = useOverlayStore(s => s.duplicateWidget);
  const selectWidgets = useOverlayStore(s => s.selectWidgets);
  const selectWidget = useOverlayStore(s => s.selectWidget);
  const bringToFront = useOverlayStore(s => s.bringToFront);
  const sendBackward = useOverlayStore(s => s.sendBackward);
  const groupSelectedWidgets = useOverlayStore(s => s.groupSelectedWidgets);
  const ungroupWidgets = useOverlayStore(s => s.ungroupWidgets);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');

  // Sort widgets by Z-Index descending (top layers first)
  const sortedWidgets = [...widgets].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

  const handleSelectToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey || e.ctrlKey) {
      if (selectedWidgetIds.includes(id)) {
        selectWidgets(selectedWidgetIds.filter(x => x !== id));
      } else {
        selectWidgets([...selectedWidgetIds, id]);
      }
    } else {
      selectWidget(id);
    }
  };

  const handleRenameStart = (widget: Widget, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(widget.id);
    setRenameVal(widget.label);
  };

  const handleRenameSave = (id: string) => {
    if (renameVal.trim()) {
      updateWidget(id, { label: renameVal.trim() });
    }
    setRenamingId(null);
  };

  // Group handling helpers
  const groups = Array.from(new Set(widgets.map(w => w.parentId).filter(Boolean))) as string[];

  return (
    <div className="flex flex-col gap-3 text-xs bg-[#0b0918] border border-purple-950/60 rounded-xl p-4 max-h-[calc(100vh-100px)] overflow-y-auto pr-2 scrollbar-thin">
      
      {/* Top Group & Order Actions */}
      <div className="flex justify-between items-center border-b border-purple-900/20 pb-2.5 flex-wrap gap-2">
        <h3 className="font-display font-black text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Layers size={13} className="text-vibeAccent" /> Layers Panel ({widgets.length})
        </h3>
        
        <div className="flex gap-1">
          {selectedWidgetIds.length > 1 && (
            <button 
              onClick={groupSelectedWidgets} 
              className="bg-vibePrimary/20 border border-vibePrimary px-2.5 py-1 rounded text-[10px] font-bold text-white hover:bg-vibePrimary/35 transition flex items-center gap-1"
            >
              <Group size={11} /> Group
            </button>
          )}
        </div>
      </div>

      {/* Layer List items */}
      <div className="flex flex-col gap-1.5">
        {sortedWidgets.length === 0 ? (
          <div className="text-center py-6 text-slate-500 italic text-[10px]">
            No layers present in this scene.
          </div>
        ) : (
          sortedWidgets.map(w => {
            const isSelected = selectedWidgetIds.includes(w.id);
            const isGrouped = Boolean(w.parentId);
            
            return (
              <div
                key={w.id}
                onClick={(e) => handleSelectToggle(w.id, e)}
                className={`p-2 rounded-lg border transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                  isSelected 
                    ? 'bg-purple-950/30 border-vibeAccent/80 shadow-[0_0_8px_rgba(168,85,247,0.2)]' 
                    : 'bg-black/20 border-purple-950/40 hover:border-purple-800/40'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {/* Select indicator checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {
                      if (selectedWidgetIds.includes(w.id)) {
                        selectWidgets(selectedWidgetIds.filter(x => x !== w.id));
                      } else {
                        selectWidgets([...selectedWidgetIds, w.id]);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded text-vibePrimary focus:ring-vibePrimary w-3.5 h-3.5 border-purple-950"
                  />

                  {/* Inline Renamer or Label text */}
                  {renamingId === w.id ? (
                    <input
                      type="text"
                      value={renameVal}
                      onChange={(e) => setRenameVal(e.target.value)}
                      onBlur={() => handleRenameSave(w.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRenameSave(w.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-black/60 border border-vibeAccent rounded px-1.5 py-0.5 text-white font-semibold text-[10px] w-full"
                      autoFocus
                    />
                  ) : (
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-slate-200 truncate flex items-center gap-1.5 text-[10.5px]">
                        {w.label}
                        {isGrouped && (
                          <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (w.parentId) ungroupWidgets(w.parentId);
                            }}
                            className="bg-slate-800 border border-slate-700/80 px-1 py-0.5 rounded text-[8px] text-slate-400 hover:text-red-400 font-normal scale-90"
                            title="Click to ungroup"
                          >
                            🔗 Grouped
                          </span>
                        )}
                      </span>
                      <span className="text-[8.5px] font-semibold text-slate-500 uppercase tracking-wider">{w.type}</span>
                    </div>
                  )}
                </div>

                {/* Layer Control Buttons (Lock, Hide, Rename, Duplicate, Delete) */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={(e) => handleRenameStart(w, e)}
                    className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white"
                    title="Rename Layer"
                  >
                    <Edit3 size={11} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateWidget(w.id, { locked: !w.locked });
                    }}
                    className={`p-1 rounded ${w.locked ? 'text-amber-500 hover:text-amber-400 bg-amber-950/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    title={w.locked ? "Unlock layer" : "Lock layer"}
                  >
                    {w.locked ? <Lock size={11} /> : <Unlock size={11} />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateWidget(w.id, { visible: !w.visible });
                    }}
                    className={`p-1 rounded ${!w.visible ? 'text-red-500 hover:text-red-400 bg-red-950/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    title={w.visible ? "Hide layer" : "Show layer"}
                  >
                    {w.visible ? <Eye size={11} /> : <EyeOff size={11} />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateWidget(w.id);
                    }}
                    className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white"
                    title="Duplicate layer"
                  >
                    <Copy size={11} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeWidget(w.id);
                    }}
                    className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-red-400"
                    title="Delete layer"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Layer Depth Quick Info */}
      <div className="border-t border-purple-900/20 pt-3 flex flex-col gap-1.5">
        <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">Sorting Order Info</span>
        <p className="text-[9.5px] text-slate-400 leading-normal">
          Layers at the top of the list are drawn in front of layers below them. Drag/order widget depth in the Inspector page.
        </p>
      </div>

    </div>
  );
};
