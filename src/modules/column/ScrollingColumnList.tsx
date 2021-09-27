import { useRef } from "react"
import { Draggable, ScrollingDndProvider } from "../ui/drag-and-drop"
import { QuickInsertForm } from "../ui/QuickInsertForm"
import type { Column } from "./Column"
import {
  addColumnToList,
  createThoughtWithinColumn,
  moveColumnWithinList,
  moveThoughtBetweenColumns,
  removeColumnFromList,
  removeThoughtFromColumn,
} from "./Column"
import { ColumnCard } from "./ColumnCard"

export function ScrollingColumnList({
  columns,
  onChange,
}: {
  columns: Column[]
  onChange: (updateFn: (prev: Column[]) => Column[]) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <ScrollingDndProvider>
      <div
        className="grid grid-flow-col gap-4 p-4 auto-cols-max grid-rows-1 mx-auto min-w-[min(1024px,100%)] max-w-full overflow-auto h-full"
        ref={containerRef}
      >
        {columns.map((column, index) => (
          <Draggable type="column" item={{ index }} key={column.id}>
            {(draggable) => (
              <div className="w-72">
                <ColumnCard
                  column={column}
                  titleRef={draggable.ref}
                  onDelete={() => onChange(removeColumnFromList(column.id))}
                  onCreateThought={(text) => {
                    onChange(
                      createThoughtWithinColumn({ columnId: column.id, text }),
                    )
                  }}
                  onDeleteThought={(thoughtId) => {
                    onChange(
                      removeThoughtFromColumn({
                        columnId: column.id,
                        thoughtId,
                      }),
                    )
                  }}
                  onMoveThought={(args) => {
                    onChange(moveThoughtBetweenColumns(args))
                  }}
                  onDropColumn={(otherIndex) => {
                    onChange(moveColumnWithinList(otherIndex, index))
                  }}
                />
              </div>
            )}
          </Draggable>
        ))}

        <div className="w-72">
          <QuickInsertForm
            onSubmit={(name) => {
              onChange(addColumnToList(name.trim()))
              requestAnimationFrame(() => {
                containerRef.current?.scrollTo({
                  left: 0,
                  behavior: "smooth",
                })
              })
            }}
          >
            <QuickInsertForm.Input
              name="createColumn.name"
              placeholder="add a new column..."
              label="column name"
            />
            <QuickInsertForm.Button title="add column" />
          </QuickInsertForm>
        </div>
      </div>
    </ScrollingDndProvider>
  )
}
