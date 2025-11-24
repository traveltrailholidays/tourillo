'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link2,
  Undo,
  Redo,
  Heading2,
  Heading3,
  Quote,
  Code,
  Strikethrough,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';
import { useEffect, useCallback, useState } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, disabled = false }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose dark:prose-invert max-w-none min-h-[350px] p-4 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-b-lg border-t border-gray-300 dark:border-gray-600',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !disabled,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  const addLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;

    const url = window.prompt('Enter image URL:');

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setTextColor = useCallback(
    (color: string) => {
      if (editor) {
        editor.chain().focus().setColor(color).run();
        setShowColorPicker(false);
      }
    },
    [editor]
  );

  const setHighlightColor = useCallback(
    (color: string) => {
      if (editor) {
        editor.chain().focus().toggleHighlight({ color }).run();
        setShowHighlightPicker(false);
      }
    },
    [editor]
  );

  if (!editor) {
    return <div className="h-[350px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />;
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        isActive
          ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
          : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
      }`}
    >
      {children}
    </button>
  );

  const textColors = [
    '#000000',
    '#e60000',
    '#ff9900',
    '#ffff00',
    '#008a00',
    '#0066cc',
    '#9933ff',
    '#ffffff',
    '#facccc',
    '#ffebcc',
    '#ffffcc',
    '#cce8cc',
    '#cce0f5',
    '#ebd6ff',
  ];

  const highlightColors = ['#ffeb3b', '#4caf50', '#2196f3', '#ff9800', '#e91e63', '#9c27b0'];

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-700 p-2 border-b border-gray-300 dark:border-gray-600 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Inline Code"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Lists & Quote */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Colors */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 relative">
          <div className="relative">
            <ToolbarButton
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowHighlightPicker(false);
              }}
              isActive={showColorPicker}
              title="Text Color"
            >
              <Palette className="h-4 w-4" />
            </ToolbarButton>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-2 z-50 grid grid-cols-7 gap-1">
                {textColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setTextColor(color)}
                    className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetColor().run();
                    setShowColorPicker(false);
                  }}
                  className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform flex items-center justify-center text-xs bg-white dark:bg-gray-800"
                  title="Reset Color"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          <div className="relative">
            <ToolbarButton
              onClick={() => {
                setShowHighlightPicker(!showHighlightPicker);
                setShowColorPicker(false);
              }}
              isActive={editor.isActive('highlight')}
              title="Highlight"
            >
              <Highlighter className="h-4 w-4" />
            </ToolbarButton>
            {showHighlightPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-2 z-50 flex gap-1">
                {highlightColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setHighlightColor(color)}
                    className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetHighlight().run();
                    setShowHighlightPicker(false);
                  }}
                  className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform flex items-center justify-center text-xs bg-white dark:bg-gray-800"
                  title="Remove Highlight"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Link & Image */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <ToolbarButton onClick={addLink} isActive={editor.isActive('link')} title="Add/Edit Link">
            <Link2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={addImage} isActive={false} title="Insert Image">
            <ImageIcon className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)" isActive={false}>
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo (Ctrl+Shift+Z)"
            isActive={false}
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
