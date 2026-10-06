import type { Editor } from '@tiptap/core'
import { BubbleMenu } from '@tiptap/react/menus'

export function TipTapTableMenu({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="tableBubbleMenu"
      className="tiptap-bubble-menu tiptap-table-menu"
      updateDelay={0}
      shouldShow={({ editor }) => editor.isEditable && editor.isActive('table')}
      options={{ placement: 'top-end', offset: 8, flip: true, shift: true }}
      getReferencedVirtualElement={() => {
        const { $from } = editor.state.selection
        for (let depth = $from.depth; depth > 0; depth--) {
          if ($from.node(depth).type.name !== 'table') continue
          const node = editor.view.nodeDOM($from.before(depth))
          if (!(node instanceof HTMLElement)) return null
          const table = node.matches('table') ? node : node.querySelector('table')
          if (!table) return null
          return { getBoundingClientRect: () => table.getBoundingClientRect(), contextElement: table }
        }
        return null
      }}
    >
      <button
        type="button"
        data-tooltip="Excluir tabela"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => editor.chain().focus().deleteTable().run()}
      >
        Excluir tabela
      </button>
    </BubbleMenu>
  )
}
