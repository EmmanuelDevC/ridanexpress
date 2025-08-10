"use client"

import { useEffect, useState, useRef } from "react"
import { AiOutlineMessage, AiOutlinePlus } from "react-icons/ai"
import { GrEmoji } from "react-icons/gr"
import { IoSend } from "react-icons/io5"
import { FaList, FaTimes } from "react-icons/fa"
import { Link, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import AddCommentIcon from "@mui/icons-material/AddComment"
import io from "socket.io-client"
import { add_friend, send_message, updateMessage, messageClear } from "../../store/reducers/chatReducer"
import toast from "react-hot-toast"
import { api_url } from "../../utils/config"

const socket = io(api_url)

const Chat = () => {
  const scrollRef = useRef()
  const dispatch = useDispatch()
  const { sellerId } = useParams()
  const [text, setText] = useState("")
  const [receverMessage, setReceverMessage] = useState("")
  const [activeSeller, setActiveSeller] = useState([])
  const { userInfo } = useSelector((state) => state.auth)
  const { fd_messages, currentFd, my_friends, successMessage } = useSelector((state) => state.chat)
  const [showSidebar, setShowSidebar] = useState(false)

  useEffect(() => {
    socket.emit("add_user", userInfo.id, userInfo)
  }, [userInfo.id, userInfo])

  useEffect(() => {
    dispatch(
      add_friend({
        sellerId: sellerId || "",
        userId: userInfo.id,
      }),
    )
  }, [sellerId, userInfo.id, dispatch])

  const send = () => {
    if (text.trim()) {
      dispatch(
        send_message({
          userId: userInfo.id,
          text,
          sellerId,
          name: userInfo.name,
        }),
      )
      setText("")
    }
  }

  useEffect(() => {
    socket.on("seller_message", (msg) => {
      setReceverMessage(msg)
    })
    socket.on("activeSeller", (sellers) => {
      setActiveSeller(sellers)
    })
    return () => {
      socket.off("seller_message")
      socket.off("activeSeller")
    }
  }, [])

  useEffect(() => {
    if (successMessage) {
      socket.emit("send_customer_message", fd_messages[fd_messages.length - 1])
      dispatch(messageClear())
    }
  }, [successMessage, fd_messages, dispatch])

  useEffect(() => {
    if (receverMessage) {
      if (sellerId === receverMessage.senderId && userInfo.id === receverMessage.receverId) {
        dispatch(updateMessage(receverMessage))
      } else {
        toast.success(receverMessage.senderName + " sent a message")
        dispatch(messageClear())
      }
    }
  }, [receverMessage, sellerId, userInfo.id, dispatch])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [fd_messages])

  return (
    <div className="bg-gray-50 rounded-xl shadow-lg h-[calc(100vh-120px)] md:h-[600px] overflow-hidden flex flex-col md:flex-row border border-gray-200">
      {/* Seller List Sidebar */}
      <div
        className={`w-full md:w-80 bg-white border-r border-gray-200 transition-all duration-300 fixed md:relative z-20 md:z-0 h-full flex flex-col ${
          showSidebar ? "left-0" : "-left-full md:left-0"
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <AiOutlineMessage className="text-indigo-600 text-2xl" />
            Conversations
          </h2>
          <button onClick={() => setShowSidebar(false)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
            <FaTimes className="text-gray-600 text-lg" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {my_friends.length > 0 ? (
            my_friends.map((f, i) => (
              <Link
                to={`/dashboard/chat/${f.fdId}`}
                key={i}
                className={`flex items-center p-4 hover:bg-indigo-50 transition-colors duration-200 ${
                  currentFd?.fdId === f.fdId ? "bg-indigo-50 border-l-4 border-indigo-600" : ""
                }`}
                onClick={() => setShowSidebar(false)}
              >
                <div className="relative mr-3">
                  <img
                    src={f.image || "/placeholder.svg?height=40&width=40&query=user profile"}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                    alt={f.name}
                  />
                  {activeSeller.some((c) => c.sellerId === f.fdId) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{f.name}</h3>
                  <p className="text-sm text-gray-500 truncate">
                    {activeSeller.some((c) => c.sellerId === f.fdId) ? (
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span> Online
                      </span>
                    ) : (
                      "Offline"
                    )}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-4 text-center h-full flex flex-col justify-center items-center text-gray-500">
              <AiOutlineMessage className="text-indigo-500 text-4xl mb-3" />
              <p className="text-lg font-medium">No sellers to chat with yet.</p>
              <p className="text-sm text-gray-400 mt-1">Start by adding a seller or making a purchase.</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Main Area */}
      <div className="flex-1 flex flex-col relative bg-white">
        {currentFd ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowSidebar(true)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
                  <FaList className="text-gray-600 text-lg" />
                </button>
                <div className="relative">
                  <img
                    src={currentFd.image || "/placeholder.svg?height=40&width=40&query=current chat user"}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                    alt={currentFd.name}
                  />
                  {activeSeller.some((c) => c.sellerId === currentFd.fdId) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">{currentFd.name}</h2>
                  <p className="text-sm text-gray-500 flex items-center">
                    {activeSeller.some((c) => c.sellerId === currentFd.fdId) ? (
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></span> Online
                      </span>
                    ) : (
                      "Offline"
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-gray-100 custom-scrollbar">
              <div className="flex flex-col gap-4">
                {fd_messages.length > 0 ? (
                  fd_messages.map((m, i) => (
                    <div
                      key={i}
                      ref={i === fd_messages.length - 1 ? scrollRef : null}
                      className={`flex ${currentFd?.fdId !== m.receverId ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[85%] flex gap-2 ${
                          currentFd?.fdId !== m.receverId ? "flex-row" : "flex-row-reverse"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-2xl ${
                            currentFd?.fdId !== m.receverId
                              ? "bg-white border border-gray-200 rounded-tl-none"
                              : "bg-indigo-600 text-white rounded-tr-none"
                          } shadow-sm transition-all duration-200 hover:shadow-md`}
                        >
                          <p className="text-sm">{m.message}</p>
                          <div className="flex items-center justify-end gap-2 mt-1">
                            <span
                              className={`text-xs ${
                                currentFd?.fdId !== m.receverId ? "text-gray-400" : "text-indigo-200"
                              }`}
                            >
                              {new Date(m.time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {currentFd?.fdId === m.receverId && (
                              <span className="text-xs">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className={currentFd?.fdId === m.receverId ? "text-indigo-200" : ""}
                                >
                                  <path d="M18 6 7 17l-5-5" />
                                  <path d="m22 10-7.5 7.5L13 16" />
                                </svg>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-8 space-y-4 text-gray-500">
                    <svg
                      className="w-24 h-24 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    <p className="text-gray-600 text-lg font-medium">Start a conversation</p>
                    <p className="text-gray-500 text-sm">Send your first message to {currentFd?.name || "this seller"}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-white shadow-lg">
              <div className="flex items-center gap-2">
                <button className="p-3 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <AiOutlinePlus className="text-xl" />
                  </label>
                  <input id="file-upload" className="hidden" type="file" />
                </button>
                <div className="flex-1 relative">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    type="text"
                    placeholder="Type your message..."
                    className="w-full p-3 pr-12 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:border-indigo-500 text-gray-800 placeholder-gray-500 shadow-inner"
                    onKeyPress={(e) => e.key === "Enter" && send()}
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600">
                    <GrEmoji className="text-xl" />
                  </button>
                </div>
                <button
                  onClick={send}
                  disabled={!text.trim()}
                  className={`p-3 rounded-full transition-all duration-200 transform hover:scale-105 ${
                    text.trim()
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <IoSend className="text-xl" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-4 bg-gradient-to-br from-gray-50 to-gray-100">
            <button
              onClick={() => setShowSidebar(true)}
              className="absolute bottom-6 right-6 shadow-lg md:hidden p-4 bg-indigo-600 text-white rounded-full mb-4 hover:bg-indigo-700 transition-colors"
            >
              <AddCommentIcon className="text-2xl" />
            </button>
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
              <AiOutlineMessage className="text-indigo-500 text-5xl mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Welcome to Chat</h3>
              <p className="text-gray-600 mb-6">
                Select a seller from the list to start messaging or view your conversation history
              </p>
              <button
                onClick={() => setShowSidebar(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-full transition-colors duration-300"
              >
                View Sellers
              </button>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
}

export default Chat