import React from 'react'
import ReactFlow, {
  Elements,
  addEdge,
  Edge,
  Connection,
  OnLoadParams,
  useZoomPanHelper,
  ReactFlowProvider,
  isEdge,
} from 'react-flow-renderer'
import { toPng } from 'dom-to-image-retina'

const getDefaultNodeStyle = () => ({
  fontSize: 14,
  borderColor: '#333333',
  borderWidth: 1,
  backgroundColor: '#ffffff',
  color: '#333333',
})

const Editor = () => {
  const [flowInstance, setFlowInstance] = React.useState<OnLoadParams | null>(
    null,
  )

  const { transform } = useZoomPanHelper()

  const restoreFlow = async () => {
    const flow = location.hash && JSON.parse(atob(location.hash.slice(1)))

    if (flow) {
      const [x = 0, y = 0] = flow.position
      setElements(flow.elements || [])
      transform({ x, y, zoom: flow.zoom || 0 })
    }
  }

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
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      animated: true,
      style: {},
    },
    { id: 'e2-3', source: '2', target: '3', style: {} },
  ])

  const getShareUrl = () => {
    return (
      location.origin + '/#' + btoa(JSON.stringify(flowInstance!.toObject()))
    )
  }

  const copyShareURL = async () => {
    await navigator.clipboard.writeText(getShareUrl())
    alert('Sharable URL has been copied to clipboard.')
  }

  const [activeNodeId, setActiveNodeId] = React.useState<string | null>(null)

  const activeNode = elements.find((element) => element.id === activeNodeId)

  const onConnect = (params: Edge<any> | Connection) => {
    setElements(addEdge(params, elements))
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
        if (element.id !== id) return element
        if (isEdge(element)) {
          return {
            ...element,
            label,
          }
        }
        return {
          ...element,
          data: {
            ...element.data,
            label,
          },
        }
      }),
    )
  }

  const updateEdgeAnimated = (id: string, animated: boolean) => {
    setElements((elements) =>
      elements.map((element) => {
        if (element.id !== id) return element
        return { ...element, animated }
      }),
    )
  }

  const saveImage = async () => {
    const url = await toPng(document.querySelector('.react-flow')!)
    const a = document.createElement('a')
    a.download = 'flowkit.png'
    a.href = url
    a.click()
  }

  React.useEffect(() => {
    restoreFlow()
  }, [])

  return (
    <div className="flex h-screen">
      <div className="h-full w-full relative">
        <ReactFlow
          onLoad={setFlowInstance}
          elements={elements}
          onConnect={onConnect}
          onElementClick={(e, element) => {
            setActiveNodeId(element.id)
          }}
        />
        <button
          onClick={saveImage}
          className="absolute right-3 bottom-3 border rounded-md text-sm px-1 h-6 flex items-center cursor-pointer z-10 hover:bg-gray-100"
        >
          Save Image
        </button>
      </div>
      <div className="border-l w-72 relative">
        <button
          onClick={copyShareURL}
          className="flex items-center text-sm w-full justify-center border-b px-3 py-3 hover:bg-gray-50"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span className="ml-2">Copy Share URL</span>
        </button>
        {activeNode && activeNodeId && (
          <div className="border-b" key={activeNodeId}>
            <div className="divide-y border-b">
              <div className="px-3 min-h-10 py-3 flex items-start justify-between">
                <span className="font-bold text-gray-700 text-sm">Text</span>
                <span>
                  <textarea
                    value={
                      isEdge(activeNode)
                        ? activeNode.label || ''
                        : activeNode.data.label
                    }
                    className="bg-gray-100"
                    onChange={(e) =>
                      updateNodeLabel(activeNodeId, e.target.value)
                    }
                  ></textarea>
                </span>
              </div>
              {isEdge(activeNode) && (
                <div className="px-3 h-10 flex items-center justify-between">
                  <span className="font-bold text-gray-700 text-sm">
                    Animated
                  </span>
                  <span>
                    <input
                      type="checkbox"
                      defaultChecked={activeNode.animated}
                      onChange={(e) => {
                        updateEdgeAnimated(activeNodeId, e.target.checked)
                      }}
                    />
                  </span>
                </div>
              )}
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
        <div className="mt-3 text-xs px-3 text-center text-gray-600">
          <a target="_blank" href="https://github.com/egoist/flowkit">
            star this on github
          </a>
        </div>

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

export default function Page() {
  return (
    <ReactFlowProvider>
      <Editor />
    </ReactFlowProvider>
  )
}
