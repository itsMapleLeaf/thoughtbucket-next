import { CheckIcon, PencilAltIcon, TrashIcon } from "@heroicons/react/solid"
import clsx from "clsx"
import React, { useEffect } from "react"
import TextArea from "react-expanding-textarea"
import { withPreventDefault } from "../../helpers"
import { Button } from "../dom/Button"
import { fadedButtonClass } from "../ui/button"
import { createDndHooks, DragPreview } from "../ui/drag-and-drop"
import { inlineIconClass } from "../ui/icon"

type ClientThought = {
  id: string
  text: string
}

export type ThoughtDragInfo = {
  index: number
  columnId: string
}

export const { useDrag: useThoughtDrag, useDrop: useThoughtDrop } =
  createDndHooks<ThoughtDragInfo>({ type: "thought" })

export function ThoughtCard({
  thought,
  columnId,
  index,
  onDelete,
  onDrop,
}: {
  thought: ClientThought
  columnId: string
  index: number
  onDelete: () => void
  onDrop: (info: ThoughtDragInfo) => void
}) {
  const [dragState, dragRef] = useThoughtDrag({
    item: { index, columnId },
  })

  const [dropState, dropRef] = useThoughtDrop({
    onDrop,
  })

  const [editing, setEditing] = React.useState(false)
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (editing) textAreaRef.current!.focus()
  }, [editing])

  return (
    <DragPreview state={dragState}>
      <div
        className={clsx(
          "flex items-center bg-gray-700 border-l-4 border-indigo-400 rounded-sm shadow group",
          dragState.isDragging && "w-64", // the card shrinks when dragging
          dropState.isOver && "opacity-50",
        )}
        ref={dropRef}
        data-testid="thought-card"
      >
        {editing ? (
          <form className="flex-1" onSubmit={withPreventDefault(() => {})}>
            <TextArea
              className="block w-full p-2 transition bg-transparent resize-none hover:bg-black/30 focus:bg-black/30 focus:outline-none"
              defaultValue={thought.text}
              ref={textAreaRef}
              onKeyDown={(event) => {
                if (event.key === "Enter" && event.ctrlKey) {
                  event.preventDefault()
                  setEditing(false)
                }
              }}
              onBlur={() => setEditing(false)}
            />
            <Button type="submit" hidden>
              save
            </Button>
          </form>
        ) : (
          <p
            className="flex-1 flex items-center p-2 cursor-[grab] self-stretch"
            ref={dragRef}
          >
            {thought.text}
          </p>
        )}

        <div className="grid w-8 min-h-[4rem] grid-rows-[2rem,2rem] transition-opacity opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
          {editing ? (
            <Button
              className={fadedButtonClass}
              title="save"
              onClick={() => setEditing(false)}
            >
              <CheckIcon className={inlineIconClass} />
            </Button>
          ) : (
            <Button
              className={fadedButtonClass}
              title="edit thought"
              onClick={() => setEditing(true)}
            >
              <PencilAltIcon className={inlineIconClass} />
            </Button>
          )}
          <Button
            className={fadedButtonClass}
            title="delete thought"
            onClick={onDelete}
          >
            <TrashIcon className={inlineIconClass} />
          </Button>
        </div>
      </div>
    </DragPreview>
  )
}
