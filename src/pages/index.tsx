import React from 'react'
import ReactFlow, {
  Elements,
  addEdge,
  Edge,
  Connection,
} from 'react-flow-renderer'

const getDefaultNodeStyle = () => ({
  fontSize: 14,
  borderColor: '#333333',
  borderWidth: 1,
  backgroundColor: '#ffffff',
  color: '#333333',
})

export default function Page() {
  const [elements, setElements] = React.useState<Elements>([
    {
      id: '1',
      type: 'input', // input node
      data: { label: 'Input Node' },
      position: { x: 350, y: 125 },
      style: getDefaultNodeStyle(),
    },
    // default node
    {
      id: '2',
      // you can also pass a React component as a label
      data: { label: 'Default Node' },
      position: { x: 100, y: 225 },
      style: getDefaultNodeStyle(),
    },
    {
      id: '3',
      type: 'output', // output node
      data: { label: 'Output Node' },
      position: { x: 350, y: 450 },
      style: getDefaultNodeStyle(),
    },
    // animated edge
    { id: 'e1-2', source: '1', target: '2', animated: true, style: {} },
    { id: 'e2-3', source: '2', target: '3', style: {} },
  ])
  const [activeNodeId, setActiveNodeId] = React.useState<string | null>(null)

  const activeNode = elements.find((element) => element.id === activeNodeId)

  const onConnect = (params: Edge<any> | Connection) => {
    console.log(params)
    setElements((els) => addEdge(params, els))
  }

  const handleChangeElementStyle = (
    prop: string,
    value: string,
    convert?: (v: any) => any,
  ) => {
    if (!activeNode) return
    activeNode.style = activeNode.style || {}
    // @ts-expect-error
    activeNode.style[prop] = convert ? convert(value) : value
    setElements(
      elements.map((element) => {
        if (element.id === activeNodeId) {
          return activeNode
        }
        return element
      }),
    )
  }

  const deleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id))
  }

  const addNewNode = () => {
    const nodes = elements.filter(
      (element) =>
        // @ts-expect-error
        !element.source,
    )
    const lastNode = nodes[nodes.length - 1]
    setElements([
      ...elements,
      {
        id: String(elements.length + 1),
        data: { label: 'Node Name' },
        connectable: true,
        position: {
          // @ts-expect-error
          x: lastNode.position.x + 100,
          // @ts-expect-error
          y: lastNode.position.y + 100,
        },
        style: getDefaultNodeStyle(),
      },
    ])
  }

  const updateNodeLabel = (id: string, label: string) => {
    setElements(
      elements.map((element) => {
        return {
          ...element,
          data: {
            ...element.data,
            label: id === element.id ? label : element.data?.label,
          },
        }
      }),
    )
  }

  return (
    <div className="flex h-screen">
      <div className="h-full w-full">
        <ReactFlow
          elements={elements}
          onConnect={onConnect}
          onElementClick={(e, element) => {
            setActiveNodeId(element.id)
          }}
        />
      </div>
      <div className="border-l w-72 relative">
        {activeNode && activeNodeId && (
          <div className="">
            <div className="divide-y border-b">
              {
                /* @ts-expect-error */
                !activeNode.source && (
                  <div className="px-3 min-h-10 py-3 flex items-start justify-between">
                    <span className="font-bold text-gray-700 text-sm">
                      Text
                    </span>
                    <span>
                      <textarea
                        value={activeNode.data.label}
                        className="bg-gray-100"
                        onChange={(e) =>
                          updateNodeLabel(activeNodeId, e.target.value)
                        }
                      ></textarea>
                    </span>
                  </div>
                )
              }
              <div className="px-3 h-10 flex items-center justify-between">
                <span className="font-bold text-gray-700 text-sm">
                  Text Color
                </span>
                <span>
                  <input
                    type="color"
                    value={activeNode.style?.color}
                    onChange={(e) =>
                      handleChangeElementStyle('color', e.target.value)
                    }
                  />
                </span>
              </div>
              <div className="px-3 h-10 flex items-center justify-between">
                <span className="font-bold text-gray-700 text-sm">
                  Background Color
                </span>
                <span>
                  <input
                    type="color"
                    value={activeNode.style?.backgroundColor}
                    onChange={(e) =>
                      handleChangeElementStyle(
                        'backgroundColor',
                        e.target.value,
                      )
                    }
                  />
                </span>
              </div>
              <div className="px-3 h-10 flex items-center justify-between">
                <span className="font-bold text-gray-700 text-sm">
                  Border Color
                </span>
                <span>
                  <input
                    type="color"
                    value={activeNode.style?.borderColor}
                    onChange={(e) =>
                      handleChangeElementStyle('borderColor', e.target.value)
                    }
                  />
                </span>
              </div>
              <div className="px-3 h-10 flex items-center justify-between">
                <span className="font-bold text-gray-700 text-sm">
                  Text Size
                </span>
                <span className="w-12">
                  <input
                    type="number"
                    value={activeNode.style?.fontSize}
                    className="w-full bg-gray-100 p-2 text-sm h-6"
                    onChange={(e) =>
                      handleChangeElementStyle(
                        'fontSize',
                        e.target.value,
                        (v) => Number(v),
                      )
                    }
                  />
                </span>
              </div>
              <div className="px-3 h-10 flex items-center justify-between">
                <span className="font-bold text-gray-700 text-sm">
                  Border Size
                </span>
                <span className="w-12">
                  <input
                    type="number"
                    value={activeNode.style?.borderWidth}
                    className="w-full bg-gray-100 p-2 text-sm h-6"
                    onChange={(e) =>
                      handleChangeElementStyle(
                        'borderWidth',
                        e.target.value,
                        (v) => Number(v),
                      )
                    }
                  />
                </span>
              </div>
            </div>

            <div className="px-3 py-5">
              <button
                type="button"
                className="text-sm bg-red-500 rounded-md text-white px-2 h-7 inline-flex items-center"
                onClick={() => deleteElement(activeNodeId)}
              >
                Delete
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => addNewNode()}
          className="h-12 border-t hover:bg-gray-100 cursor-pointer absolute left-0 right-0 bottom-0 w-full justify-center items-center flex"
        >
          New Node
        </button>
      </div>
    </div>
  )
}
