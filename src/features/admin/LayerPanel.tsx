import React, { useState, useEffect } from 'react';
import { useOverlayStore, type Widget } from '../../store/overlayStore';
import { 
  Eye, EyeOff, Lock, Unlock, Trash2, Copy, 
  Layers, Edit3, Folder, FolderOpen, Search, Filter,
  ChevronDown, ChevronRight, X, Grid, Move, ArrowUp, ArrowDown
} from 'lucide-react';

export const LayerPanel: React.FC = () => {
  const activeScene = useOverlayStore(s => s.currentScene);
  const selectedWidgetIds = useOverlayStore(s => s.selectedWidgetIds);
  const widgets = useOverlayStore(s => s.sceneWidgets[activeScene] || []);
  
  const updateWidget = useOverlayStore(s => s.updateWidget);
  const updateWidgets = useOverlayStore(s => s.updateWidgets);
  const removeWidget = useOverlayStore(s => s.removeWidget);
  const duplicateWidget = useOverlayStore(s => s.duplicateWidget);
  const selectWidgets = useOverlayStore(s => s.selectWidgets);
  const selectWidget = useOverlayStore(s => s.selectWidget);
  const groupSelectedWidgets = useOverlayStore(s => s.groupSelectedWidgets);
  const ungroupWidgets = useOverlayStore(s => s.ungroupWidgets);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'visible' | 'hidden' | 'locked' | 'unlocked'>('all');

  // Collapse status of virtual folders
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  // Custom group folder names
  const [groupNames, setGroupNames] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('vibe_group_names');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const saveGroupNames = (newNames: Record<string, string>) => {
    setGroupNames(newNames);
    localStorage.setItem('vibe_group_names', JSON.stringify(newNames));
  };

  const handleGroupRename = (groupId: string, newName: string) => {
    saveGroupNames({
      ...groupNames,
      [groupId]: newName
    });
  };

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

  // Filter widgets by search and filter status
  const filteredWidgets = sortedWidgets.filter(w => {
    const matchesSearch = w.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          w.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (filterType) {
      case 'visible': return w.visible;
      case 'hidden': return !w.visible;
      case 'locked': return w.locked;
      case 'unlocked': return !w.locked;
      default: return true;
    }
  });

  // Toggle Visibility for a whole Group
  const toggleGroupVisibility = (groupId: string, currentlyVisible: boolean) => {
    const groupWidgets = widgets.filter(w => w.parentId === groupId);
    const updates: Record<string, Partial<Widget>> = {};
    groupWidgets.forEach(w => {
      updates[w.id] = { visible: !currentlyVisible };
    });
    updateWidgets(updates);
  };

  // Toggle Lock for a whole Group
  const toggleGroupLock = (groupId: string, currentlyLocked: boolean) => {
    const groupWidgets = widgets.filter(w => w.parentId === groupId);
    const updates: Record<string, Partial<Widget>> = {};
    groupWidgets.forEach(w => {
      updates[w.id] = { locked: !currentlyLocked };
    });
    updateWidgets(updates);
  };

  const deleteGroup = (groupId: string) => {
    const groupWidgets = widgets.filter(w => w.parentId === groupId);
    groupWidgets.forEach(w => removeWidget(w.id));
  };

  const toggleGroupSelection = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const groupWidgetIds = widgets.filter(w => w.parentId === groupId).map(w => w.id);
    selectWidgets(groupWidgetIds);
  };

  // Render a single layer row item
  const renderLayerRow = (w: Widget, isChild = false) => {
    const isSelected = selectedWidgetIds.includes(w.id);
    return (
      <div
        key={w.id}
        onClick={(e) => handleSelectToggle(w.id, e)}
        className={`group p-2 rounded-lg border transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
          isChild ? 'ml-5' : ''
        } ${
          isSelected 
            ? 'bg-purple-950/30 border-vibeAccent/80 shadow-[0_0_8px_rgba(168,85,247,0.2)]' 
            : 'bg-black/15 border-purple-950/40 hover:border-purple-800/40'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
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
            className="rounded text-vibePrimary focus:ring-vibePrimary w-3.5 h-3.5 border-purple-950 cursor-pointer accent-vibePrimary"
          />

          {renamingId === w.id ? (
            <input
              type="text"
              value={renameVal}
              onChange={(e) => setRenameVal(e.target.value)}
              onBlur={() => handleRenameSave(w.id)}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameSave(w.id)}
              onClick={(e) => e.stopPropagation()}
              className="bg-black/60 border border-vibeAccent rounded px-1.5 py-0.5 text-white font-semibold text-[10px] w-full focus:outline-none"
              autoFocus
            />
          ) : (
            <div className="flex flex-col min-w-0" onDoubleClick={(e) => handleRenameStart(w, e)}>
              <span className="font-bold text-slate-200 truncate text-[10px]">
                {w.label}
              </span>
              <span className="text-[8px] font-semibold text-slate-500 uppercase tracking-wider">{w.type}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
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
            title={w.locked ? "Unlock" : "Lock"}
          >
            {w.locked ? <Lock size={11} /> : <Unlock size={11} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateWidget(w.id, { visible: !w.visible });
            }}
            className={`p-1 rounded ${!w.visible ? 'text-red-500 hover:text-red-400 bg-red-950/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            title={w.visible ? "Hide" : "Show"}
          >
            {w.visible ? <Eye size={11} /> : <EyeOff size={11} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeWidget(w.id);
            }}
            className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-red-400"
            title="Delete Layer"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    );
  };

  // Render a Group collapsible Folder
  const renderGroupFolder = (groupId: string) => {
    const isCollapsed = collapsedGroups[groupId];
    const groupWidgets = filteredWidgets.filter(w => w.parentId === groupId);
    if (groupWidgets.length === 0) return null; // No children match search query

    const groupTitle = groupNames[groupId] || `Folder Group (${groupId.split('-')[1]?.slice(0,4) || 'Group'})`;
    const isAllVisible = groupWidgets.every(w => w.visible);
    const isAnyLocked = groupWidgets.some(w => w.locked);

    return (
      <div key={groupId} className="flex flex-col gap-1 border border-purple-950/30 bg-purple-950/5 rounded-xl p-1.5">
        
        {/* Folder Header */}
        <div 
          onClick={(e) => toggleGroupSelection(groupId, e)}
          className="flex items-center justify-between p-1.5 hover:bg-purple-900/10 rounded-lg cursor-pointer text-slate-300 font-bold"
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
              }}
              className="p-0.5 hover:bg-white/5 rounded text-slate-400"
            >
              {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            </button>
            {isCollapsed ? (
              <Folder size={13} className="text-vibeSecondary flex-shrink-0" />
            ) : (
              <FolderOpen size={13} className="text-vibeSecondary flex-shrink-0" />
            )}
            
            <input 
              type="text" 
              value={groupTitle}
              onChange={(e) => handleGroupRename(groupId, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent font-bold text-white text-[10.5px] truncate focus:outline-none focus:bg-black/50 px-1 rounded border-transparent border focus:border-purple-900/60 w-32"
            />
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                ungroupWidgets(groupId);
              }}
              className="px-1.5 py-0.5 bg-slate-800 hover:bg-red-950/30 text-[7.5px] rounded text-slate-400 hover:text-red-400 font-black tracking-widest uppercase border border-slate-700/50"
              title="Ungroup elements"
            >
              Ungroup
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleGroupLock(groupId, isAnyLocked);
              }}
              className={`p-1 rounded ${isAnyLocked ? 'text-amber-500 bg-amber-950/20' : 'text-slate-400 hover:text-white'}`}
              title="Toggle group lock"
            >
              {isAnyLocked ? <Lock size={11} /> : <Unlock size={11} />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleGroupVisibility(groupId, isAllVisible);
              }}
              className={`p-1 rounded ${!isAllVisible ? 'text-red-500 bg-red-950/20' : 'text-slate-400 hover:text-white'}`}
              title="Toggle group visibility"
            >
              {isAllVisible ? <Eye size={11} /> : <EyeOff size={11} />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteGroup(groupId);
              }}
              className="p-1 hover:bg-red-500/10 rounded text-slate-400 hover:text-red-500"
              title="Delete group items"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>

        {/* Indented Children */}
        {!isCollapsed && (
          <div className="flex flex-col gap-1 pr-1 pl-1">
            {groupWidgets.map(w => renderLayerRow(w, true))}
          </div>
        )}
      </div>
    );
  };

  // Render top-level list items (either standalone rows or group folders)
  const renderList = () => {
    const renderedGroups = new Set<string>();
    
    return filteredWidgets.map(w => {
      if (w.parentId) {
        if (renderedGroups.has(w.parentId)) return null;
        renderedGroups.add(w.parentId);
        return renderGroupFolder(w.parentId);
      }
      return renderLayerRow(w);
    });
  };

  return (
    <div className="flex flex-col gap-3 text-xs bg-[#0b0918]/90 border border-purple-950/60 rounded-2xl p-4 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 scrollbar-thin shadow-glow">
      
      {/* Sidebar Header & Group Action */}
      <div className="flex justify-between items-center border-b border-purple-900/25 pb-2.5 flex-wrap gap-2">
        <h3 className="font-display font-black text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Layers size={13} className="text-vibeAccent animate-pulse" /> Layers Panel ({widgets.length})
        </h3>
        
        {selectedWidgetIds.length > 1 && (
          <button 
            onClick={groupSelectedWidgets} 
            className="bg-vibePrimary/25 border border-vibePrimary px-2 py-0.5 rounded-lg text-[9px] font-extrabold text-white hover:bg-vibePrimary/40 transition flex items-center gap-1 uppercase tracking-widest"
          >
            <Folder size={10} /> Group ({selectedWidgetIds.length})
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-1.5 bg-black/20 p-2 border border-purple-950/40 rounded-xl">
        <div className="flex items-center gap-1.5 bg-black/40 border border-purple-950/65 px-2 py-1 rounded-lg">
          <Search size={11} className="text-slate-500" />
          <input 
            type="text" 
            placeholder="Search layers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white w-full text-[10px] focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-white">
              <X size={11} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 justify-between text-[10px]">
          <span className="text-slate-500 font-bold flex items-center gap-1"><Filter size={10} /> Filter:</span>
          <select 
            value={filterType} 
            onChange={(e: any) => setFilterType(e.target.value)}
            className="bg-black/50 border border-purple-950/50 rounded-lg p-0.5 text-white text-[9px] focus:outline-none"
          >
            <option value="all">All Elements</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden Only</option>
            <option value="locked">Locked Only</option>
            <option value="unlocked">Unlocked Only</option>
          </select>
        </div>
      </div>

      {/* Layer List Items */}
      <div className="flex flex-col gap-1.5 pr-0.5">
        {widgets.length === 0 ? (
          <div className="text-center py-6 text-slate-500 italic text-[10px]">
            No layers present in this scene.
          </div>
        ) : (
          renderList()
        )}
      </div>

      {/* Layer Depth quick actions info */}
      <div className="border-t border-purple-900/20 pt-3 flex flex-col gap-1 text-slate-500 leading-relaxed text-[9px]">
        <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">Hierarchy Order</span>
        <p>
          Layers at the top draw above others. Double click a layer's label text to rename it instantly.
        </p>
      </div>

    </div>
  );
};
