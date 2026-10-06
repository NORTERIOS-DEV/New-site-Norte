import type { Editor } from '@tiptap/core'
import { isTextSelection } from '@tiptap/core'
import { BubbleMenu } from '@tiptap/react/menus'
import { promptForLink } from '../../tiptap/linkPrompt'
import { IconBold, IconItalic, IconLink, IconUnderline } from '../../tiptap/toolbarIcons'

type TipTapBubbleMenuProps = {
  editor: Editor
}

export function TipTapBubbleMenu({ editor }: TipTapBubbleMenuProps) {
  return (
    <BubbleMenu
      editor={editor}
      className="tiptap-bubble-menu"
      shouldShow={({ editor, state }) =>
        editor.isEditable &&
        isTextSelection(state.selection) &&
        !state.selection.empty &&
        state.doc.textBetween(state.selection.from, state.selection.to).trim().length > 0
      }
    >
      <button
        type="button"
        data-tooltip="Negrito"
        className={editor.isActive('bold') ? 'is-active' : ''}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <IconBold />
      </button>
      <button
        type="button"
        data-tooltip="Itálico"
        className={editor.isActive('italic') ? 'is-active' : ''}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <IconItalic />
      </button>
      <button
        type="button"
        data-tooltip="Sublinhado"
        className={editor.isActive('underline') ? 'is-active' : ''}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <IconUnderline />
      </button>
      <button
        type="button"
        data-tooltip="Link"
        className={editor.isActive('link') ? 'is-active' : ''}
        onClick={() => promptForLink(editor)}
      >
        <IconLink />
      </button>
    </BubbleMenu>
  )
}
