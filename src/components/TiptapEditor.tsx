"use client";

import { useEffect, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/utils";

type ToolbarAction = {
  label: string;
  isActive: () => boolean;
  onClick: () => void;
};

type ToolbarGroup = {
  id: string;
  actions: ToolbarAction[];
};

export type TiptapEditorProps = {
  value?: string;
  onContentChangeAction?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  editorClassName?: string;
  defaultContent?: string;
};

const DEFAULT_PLACEHOLDER = "请输入内容";

/**
 * Rich text editor built on Tiptap v3 with a basic formatting toolbar.
 */

export function TiptapEditor({
  value,
  onContentChangeAction,
  placeholder = DEFAULT_PLACEHOLDER,
  disabled = false,
  className,
  editorClassName,
  defaultContent = "",
}: TiptapEditorProps) {
  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          bulletList: { keepMarks: true },
          orderedList: { keepMarks: true },
        }),
        Underline,
        Placeholder.configure({
          placeholder,
        }),
      ],
      content: typeof value === "string" ? value : defaultContent,
      editable: !disabled,
      autofocus: false,
      immediatelyRender: false,
      onUpdate: ({ editor }) => {
        onContentChangeAction?.(editor.getHTML());
      },
    },
    [placeholder],
  );

  useEffect(() => {
    if (!editor) return;

    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;
    if (typeof value === "string") {
      if (value === editor.getHTML()) return;
      editor.commands.setContent(value, { emitUpdate: false });
      return;
    }

    if (!defaultContent || editor.getHTML() === defaultContent) {
      return;
    }

    editor.commands.setContent(defaultContent, { emitUpdate: false });
  }, [editor, value, defaultContent]);

  const toolbarGroups = useMemo<ToolbarGroup[]>(
    () => [
      {
        id: "basic",
        actions: [
          {
            label: "加粗",
            isActive: () => editor?.isActive("bold") ?? false,
            onClick: () => {
              editor?.chain().focus().toggleBold().run();
            },
          },
          {
            label: "斜体",
            isActive: () => editor?.isActive("italic") ?? false,
            onClick: () => {
              editor?.chain().focus().toggleItalic().run();
            },
          },
          {
            label: "下划线",
            isActive: () => editor?.isActive("underline") ?? false,
            onClick: () => {
              editor?.chain().focus().toggleUnderline().run();
            },
          },
          {
            label: "删除线",
            isActive: () => editor?.isActive("strike") ?? false,
            onClick: () => {
              editor?.chain().focus().toggleStrike().run();
            },
          },
        ],
      },
      {
        id: "structure",
        actions: [
          {
            label: "标题",
            isActive: () => editor?.isActive("heading", { level: 2 }) ?? false,
            onClick: () => {
              editor?.chain().focus().toggleHeading({ level: 2 }).run();
            },
          },
          {
            label: "引用",
            isActive: () => editor?.isActive("blockquote") ?? false,
            onClick: () => {
              editor?.chain().focus().toggleBlockquote().run();
            },
          },
          {
            label: "代码块",
            isActive: () => editor?.isActive("codeBlock") ?? false,
            onClick: () => {
              editor?.chain().focus().toggleCodeBlock().run();
            },
          },
        ],
      },
      {
        id: "lists",
        actions: [
          {
            label: "无序列表",
            isActive: () => editor?.isActive("bulletList") ?? false,
            onClick: () => {
              editor?.chain().focus().toggleBulletList().run();
            },
          },
          {
            label: "有序列表",
            isActive: () => editor?.isActive("orderedList") ?? false,
            onClick: () => {
              editor?.chain().focus().toggleOrderedList().run();
            },
          },
        ],
      },
      {
        id: "clear",
        actions: [
          {
            label: "清除格式",
            isActive: () => false,
            onClick: () => {
              editor?.chain().focus().clearNodes().unsetAllMarks().run();
            },
          },
        ],
      },
    ],
    [editor],
  );

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-0 overflow-hidden rounded-lg border border-slate-200 bg-white transition focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 sm:rounded-xl",
        className,
      )}
    >
      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-slate-50/80 px-2 py-2 text-[11px] text-slate-600 sm:flex-wrap sm:rounded-t-xl sm:px-3 sm:text-xs">
        {toolbarGroups.map(({ id, actions }) => (
          <div
            key={id}
            className="flex shrink-0 items-center gap-1 border-r border-slate-200 pr-2 last:border-r-0 last:pr-0 sm:shrink"
          >
            {actions.map(({ label, isActive, onClick }) => {
              const active = isActive();

              return (
                <button
                  key={label}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={onClick}
                  disabled={disabled}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 sm:text-xs",
                    active
                      ? "bg-slate-900/10 text-slate-900 shadow-sm ring-1 ring-slate-300"
                      : "hover:bg-white hover:text-slate-900",
                    disabled &&
                      "cursor-not-allowed opacity-50 hover:bg-transparent",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div
        className={cn(
          "min-h-40 max-h-8 overflow-y-auto bg-white p-3 text-sm leading-relaxed text-slate-900 sm:min-h-48 sm:max-h-9 sm:rounded-b-xl sm:p-4",
          disabled && "bg-slate-100 text-slate-500",
          editorClassName,
        )}
      >
        <EditorContent
          editor={editor}
          className="outline-none space-y-3 [&_a]:text-slate-900 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-3 [&_blockquote]:text-slate-600 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_h2]:text-lg [&_h2]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:leading-relaxed [&_pre]:rounded-lg [&_pre]:bg-slate-900 [&_pre]:p-3 [&_pre]:text-slate-100 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-6"
        />
      </div>
    </div>
  );
}
