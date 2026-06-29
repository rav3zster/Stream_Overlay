import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { EditorCanvas } from '../editor/canvas/EditorCanvas';
import { TopToolbar } from '../editor/toolbar/TopToolbar';
import { LeftPanel } from '../editor/panels/LeftPanel';
import { RightPanel } from '../editor/panels/RightPanel';
import { useEditorStore } from '../store/editorStore';

export const EditorPage: React.FC = () => {
  const {
    undo, redo,
    copySelected, pasteClipboard, removeSelectedWidgets,
    selectedIds, duplicateWidget,
  } = useEditorStore();

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useHotkeys('ctrl+z, meta+z', (e) => { e.preventDefault(); undo(); }, { enableOnFormTags: false });
  useHotkeys('ctrl+y, meta+shift+z, ctrl+shift+z', (e) => { e.preventDefault(); redo(); }, { enableOnFormTags: false });
  useHotkeys('ctrl+c, meta+c', (e) => { e.preventDefault(); copySelected(); }, { enableOnFormTags: false });
  useHotkeys('ctrl+v, meta+v', (e) => { e.preventDefault(); pasteClipboard(); }, { enableOnFormTags: false });
  useHotkeys('ctrl+d, meta+d', (e) => {
    e.preventDefault();
    if (selectedIds.length === 1) duplicateWidget(selectedIds[0]);
  }, { enableOnFormTags: false });
  useHotkeys('delete, backspace', (e) => {
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')) return;
    e.preventDefault();
    removeSelectedWidgets();
  }, { enableOnFormTags: false });
  useHotkeys('escape', () => {
    useEditorStore.getState().deselectAll();
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <TopToolbar />

      <div className="editor-layout" style={{ flex: 1, minHeight: 0 }}>
        {/* Left Panel: Scenes, Layers, Widgets, Assets, Presets, Themes, Settings */}
        <LeftPanel />

        {/* Canvas */}
        <div className="canvas-area" style={{ flex: 1, height: '100%', position: 'relative' }}>
          <EditorCanvas />
        </div>

        {/* Right Panel: Inspector */}
        <RightPanel />
      </div>
    </div>
  );
};
