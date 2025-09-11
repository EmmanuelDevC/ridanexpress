import React, { useEffect, useState, useRef, useCallback } from "react";
import { AiOutlineMessage, AiOutlineShoppingCart, AiOutlineSearch, AiOutlineMenu } from "react-icons/ai";
import { IoSend } from "react-icons/io5";
import { FaArrowLeft, FaTimes, FaReply, FaStar, FaStarHalfAlt, FaRegStar, FaSmile } from "react-icons/fa";
import { FiHome } from "react-icons/fi"
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";
import { add_friend, send_message, updateMessage, messageClear } from "../../store/reducers/chatReducer";
import { add_to_card_from_chat } from "../../store/reducers/cardReducer";
import toast from "react-hot-toast";
import { api_url } from "../../utils/config";
import ProductCard from "../../components/ProductCard";
import InvoiceCard from "../../components/InvoiceCard";
import CartPreview from "../../components/CartPreview";
import OrderStatus from "../../components/OrderStatus";

// Base64 encoded sound files
const sentSound = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADwADw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PD///////////////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAADwk1ZoAQAAADghh8Dg8CAgICA4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4OA==";
const receivedSound = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Lcera2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADwADw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PD///////////////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAADQaWR2AQAAADghh8Dg8CAgICA4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4OA==";

// Create a stable socket connection with reconnection logic
const createSocketConnection = () => {
  return io(api_url, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    forceNew: true
  });
};

// Format time function - handles multiple timestamp properties
const formatTime = (message) => {
  const timestamp = message.time || message.timestamp || message.createdAt;
  if (!timestamp) return '';

  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

// Helper function to create consistent chat room IDs
const getChatRoomId = (id1, id2) => {
  // Sort IDs to ensure consistent room naming regardless of sender/receiver order
  const sortedIds = [id1, id2].sort();
  return `chat_${sortedIds[0]}_${sortedIds[1]}`;
};

// Function to normalize product data structure
const normalizeProductData = (product) => {
  if (!product) return null;
  
  return {
    _id: product._id || product.id,
    slug: product.slug || '',
    name: product.name || 'Product Name',
    images: product.images || [product.image] || [],
    image: product.image || (product.images && product.images[0]) || '',
    price: product.price || 0,
    discount: product.discount || 0,
    rating: product.rating || 0,
    stock: product.stock || 0,
    status: product.status || ''
  };
};

const Chat = () => {
  const scrollRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sellerId } = useParams();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [text, setText] = useState("");
  const [activeSellers, setActiveSellers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingSeller, setTypingSeller] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { userInfo } = useSelector((state) => state.auth);
  const { fd_messages = [], currentFd, my_friends = [], successMessage } = useSelector((state) => state.chat || {});
  const { card_product_count } = useSelector(state => state.card);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const sentAudioRef = useRef(null);
  const receivedAudioRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastMessageRef = useRef('');
  const socketRef = useRef(null);

  // Play sent message sound
  const playSentSound = () => {
    if (sentAudioRef.current) {
      sentAudioRef.current.currentTime = 0;
      sentAudioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
  };

  // Play received message sound
  const playReceivedSound = () => {
    if (receivedAudioRef.current) {
      receivedAudioRef.current.currentTime = 0;
      receivedAudioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
  };

  // Initialize socket connection
  useEffect(() => {
    const newSocket = createSocketConnection();
    setSocket(newSocket);
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      newSocket.emit("add_user", userInfo.id, userInfo);
      
      // Rejoin chat room on reconnect
      if (sellerId && userInfo) {
        const chatId = getChatRoomId(userInfo.id, sellerId);
        newSocket.emit('join_chat', chatId);
        console.log('Rejoined chat room on reconnect:', chatId);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('reconnect', () => {
      console.log('Reconnected to server');
      setIsConnected(true);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    // Listen for active sellers
    newSocket.on('active_sellers', (sellers) => {
      setActiveSellers(sellers);
    });

    // Listen for new messages
    newSocket.on('receive_message', (msg) => {
      console.log('Received message:', msg);
      // Check if this is a duplicate of our own message
      const isDuplicate = lastMessageRef.current === msg.text &&
        msg.senderId === userInfo.id;

      if (!isDuplicate) {
        // Ensure message has consistent timestamp property
        const processedMsg = {
          ...msg,
          time: msg.time || msg.timestamp || msg.createdAt
        };
        dispatch(updateMessage(processedMsg));
        playReceivedSound();
      } else {
        lastMessageRef.current = '';
      }
    });

    // Listen for typing indicators
    newSocket.on('typing_indicator', (data) => {
      if (data.senderId === currentFd?.fdId) {
        setTypingSeller(data.isTyping ? currentFd : null);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [userInfo, dispatch, currentFd]);

  // Join chat room when sellerId changes
  useEffect(() => {
    if (socket && sellerId && userInfo) {
      const chatId = getChatRoomId(userInfo.id, sellerId);
      socket.emit('join_chat', chatId);
      console.log('Customer joined chat room:', chatId);
    }
  }, [socket, sellerId, userInfo]);

  useEffect(() => {
    if (userInfo && userInfo.id) {
      dispatch(add_friend({ sellerId: sellerId || "", userId: userInfo.id }));
    }
  }, [sellerId, userInfo, dispatch]);

  // Message sending with retry mechanism
  const sendMessageWithRetry = useCallback(async (messageData, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        await dispatch(send_message(messageData));
        return true;
      } catch (error) {
        console.error(`Failed to send message (attempt ${i + 1}):`, error);
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    return false;
  }, [dispatch]);

  const send = useCallback(async () => {
    if (text.trim()) {
      try {
        const messageData = {
          userId: userInfo.id,
          text,
          sellerId,
          name: userInfo.name,
          senderId: userInfo.id,
          receverId: sellerId
        };

        // Store the message to check for duplicates
        lastMessageRef.current = text;

        // Send via Redux (HTTP) - this should save to database
        await sendMessageWithRetry(messageData);

        // Also send via socket for real-time delivery
        if (socket && isConnected) {
          socket.emit("send_customer_message", {
            ...messageData,
            timestamp: new Date().toISOString()
          }, (ack) => {
            if (ack && ack.status === 'ok') {
              console.log('Message delivered');
            } else {
              console.log('Message failed to deliver');
              // Implement retry logic here if needed
            }
          });
        }

        setText("");
        playSentSound();

        if (socket && isTyping) {
          socket.emit('typing_stop', {
            senderId: userInfo.id,
            receverId: sellerId
          });
          setIsTyping(false);
        }
      } catch (error) {
        toast.error('Failed to send message. Please try again.');
      }
    }
  }, [text, userInfo, sellerId, socket, isConnected, isTyping, sendMessageWithRetry]);

  // Handle input change with typing indicator
  const handleInputChange = (e) => {
    setText(e.target.value);

    if (socket && sellerId && !isTyping) {
      socket.emit('typing_start', {
        senderId: userInfo.id,
        receverId: sellerId
      });
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socket && isTyping) {
        socket.emit('typing_stop', {
          senderId: userInfo.id,
          receverId: sellerId
        });
        setIsTyping(false);
      }
    }, 1000);
  };

  const handleAddToCart = (product) => {
    dispatch(add_to_card_from_chat(product));
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = (product) => {
    dispatch(add_to_card_from_chat(product));

    if (userInfo) {
      navigate('/checkout');
    } else {
      toast.error('Please login to proceed to checkout');
      navigate('/login');
    }
  };

  const handlePayInvoice = (invoice) => {
    toast.success(`Processing payment for invoice #${invoice.id}`);
  };

  useEffect(() => {
    if (successMessage) {
      dispatch(messageClear());
    }
  }, [successMessage, dispatch]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [fd_messages, typingSeller]);

  const filteredMessages = fd_messages.filter(m => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();

    const msgText = m.text || m.content || m.message?.content || "";

    if (m.type === "text" && msgText.toLowerCase().includes(searchLower)) return true;

    if (m.type === "product" && m.content?.name?.toLowerCase().includes(searchLower)) return true;

    if (m.type === "invoice" && m.content) {
      const invoiceText = `Invoice #${m.content.id} Total: $${m.content.total}`;
      if (invoiceText.toLowerCase().includes(searchLower)) return true;
    }

    return false;
  });

  return (
    <div className="bg-gray-50 rounded-lg md:rounded-xl h-screen md:h-[600px] overflow-hidden flex flex-col md:flex-row border border-gray-200 relative">
      {/* Audio elements for notifications */}
      <audio ref={sentAudioRef} src={sentSound} preload="auto" />
      <audio ref={receivedAudioRef} src={receivedSound} preload="auto" />

      {/* Mobile Header with Menu Button */}
      <div className="md:hidden flex items-center justify-between p-2 bg-white border-b border-gray-200">
        <Link to="/dashboard">
          <button className="p-2 bg-orange-500 font-semibold hover:bg-orange-700 rounded-lg">
            <FiHome className="text-white font-bold text-xl" />
          </button>
        </Link>
        <h2 className="text-lg font-semibold text-orange-600 px-6 rounded-full border border-white">Chat Seller.</h2>
        <div className="w-10"></div> {/*Spacer for balance */}
      </div>

      {/* Seller List Sidebar */}
      <div className={`w-full md:w-80 bg-white border-r border-gray-200 transition-all duration-300 fixed md:relative z-30 md:z-0 h-full flex flex-col ${showSidebar ? "left-0" : "-left-full md:left-0"}`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <AiOutlineMessage className="text-orange-600 text-2xl" />
            chats
          </h2>
          <button onClick={() => setShowSidebar(false)} className="p-2 hover:bg-gray-100 rounded-lg">
            <FaTimes className="text-gray-600 text-lg" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {my_friends.length > 0 ? (
            my_friends.map((f, i) => (
              <Link
                to={`/dashboard/chat/${f.fdId}`}
                key={i}
                className={`flex items-center p-4 hover:bg-black-50 transition-colors duration-200 ${currentFd?.fdId === f.fdId ? "bg-indigo-50 border-l-4 border-gray-800" : ""}`}
                onClick={() => setShowSidebar(false)}
              >
                <div className="relative mr-3">
                  <img
                    src={f.image || "/placeholder.svg?height=40&width=40&query=user profile"}
                    className="w-12 h-12 rounded-sm object-cover border-2 border-white shadow-sm"
                    alt={f.name}
                  />
                  {activeSellers.some((c) => c.userId === f.fdId) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-xs border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-800 truncate">{f.name}</h3>
                  <p className="text-sm text-gray-500 truncate">
                    {activeSellers.some((c) => c.userId === f.fdId) ? (
                      <span className="flex text-sm items-center">
                        Active
                      </span>
                    ) : (
                      <span className="flex text-sm items-center">
                        busy...
                      </span>
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

      {/* Overlay for mobile sidebar */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setShowSidebar(false)}
        ></div>
      )}

      {/* Chat Main Area */}
      <div className="flex-1 flex flex-col relative bg-white min-h-0">
        {currentFd ? (
          <>
            <div className="p-3 md:p-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowSidebar(true)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
                  <FaArrowLeft className="text-orange-500 text-lg" />
                </button>
                <div className="relative">
                  <img
                    src={currentFd.image || "/placeholder.svg?height=40&width=40&query=current chat user"}
                    className="w-10 h-10 rounded-lg object-cover border-2 border-gray-200"
                    alt={currentFd.name}
                  />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800 text-sm md:text-base">{currentFd.name}</h2>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Link to="/card">
                  <button
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
                  >
                    <AiOutlineShoppingCart className="text-xl" />
                    {card_product_count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {card_product_count}
                      </span>
                    )}
                  </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Typing Indicator */}
            {typingSeller && (
              <div className="px-4 py-2 bg-gray-100 text-gray-500 text-sm flex items-center">
                <div className="typing-dots flex space-x-1 mr-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
                {typingSeller.name} is typing...
              </div>
            )}

            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-3 md:p-4 bg-gradient-to-br from-gray-50 to-gray-100 custom-scrollbar min-h-0"
            >
              <div className="flex flex-col gap-3 md:gap-4">
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((m, i) => {
                    // Normalize product data before passing to ProductCard
                    const normalizedProduct = m.type === 'product' ? normalizeProductData(m.content) : null;
                    
                    return (
                      <div
                        key={i}
                        className={`flex ${currentFd?.fdId !== m.receverId ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[85%] flex gap-2 ${currentFd?.fdId !== m.receverId ? "flex-row" : "flex-row-reverse"}`}
                        >
                          {m.type === 'product' && normalizedProduct ? (
                            <ProductCard
                              product={normalizedProduct}
                            />
                          ) : m.type === 'invoice' ? (
                            <InvoiceCard
                              invoice={m.content}
                              onPay={handlePayInvoice}
                            />
                          ) : m.type === 'status' ? (
                            <OrderStatus status={m.content} />
                          ) : (
                            <div
                              className={`p-3 rounded-2xl ${currentFd?.fdId !== m.receverId
                                ? "bg-gray-600 text-white border border-gray-200 rounded-tl-none"
                                : "bg-gray-800 text-white rounded-tr-none"
                                } shadow-sm transition-all duration-200 hover:shadow-md`}
                            >
                              <p className="text-sm">{m.content || m.message?.content || m.text}</p>

                              <div className="flex items-center justify-end gap-2 mt-1">
                                <span
                                  className={`text-xs ${currentFd?.fdId !== m.receverId ? "text-gray-400" : "text-indigo-200"}`}
                                >
                                  {formatTime(m)}
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
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-8 space-y-4 text-gray-500">
                    <svg
                      className="w-16 h-16 md:w-24 md:h-24 text-gray-300"
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
                    <p className="text-gray-600 text-base md:text-lg font-medium">Start a conversation</p>
                    <p className="text-gray-500 text-xs md:text-sm text-center">Send your first message to {currentFd?.name || "this seller"}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cart Preview */}
            {showCart && (
              <CartPreview
                onClose={() => setShowCart(false)}
                onCheckout={() => {
                  if (userInfo) {
                    navigate('/checkout');
                  } else {
                    toast.error('Please login to checkout');
                    navigate('/login');
                  }
                }}
                onViewCart={() => {
                  if (userInfo) {
                    navigate('/cart');
                  } else {
                    toast.error('Please login to view your cart');
                    navigate('/login');
                  }
                }}
              />
            )}

            <div className="p-3 md:p-4 border-t border-gray-200 bg-white shadow-lg">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={text}
                    onChange={handleInputChange}
                    placeholder="Hi, Ridan Seller..."
                    className="w-full p-3 md:p-3 pr-10 md:pr-10 border border-orange-500 rounded-full focus:outline-none focus:border-indigo-500 text-gray-800 placeholder-gray-500 shadow-inner text-sm md:text-base resize-none min-h-[44px] max-h-32 overflow-y-auto"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    rows={1}
                    style={{
                      lineHeight: '1.5',
                    }}
                  />
                </div>
                <button
                  onClick={send}
                  disabled={!text.trim() || !isConnected}
                  className={`p-3 md:p-3 rounded-full transition-all duration-200 transform hover:scale-105 ${text.trim() && isConnected
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                >
                  <IoSend className="text-2xl md:text-xl" />
                </button>
              </div>

              {/* Search in Chat */}
              <div className="mt-3 flex items-center">
                <AiOutlineSearch className="text-gray-400 mr-2 text-sm md:text-base" />
                <input
                  type="text"
                  placeholder="Search in chat..."
                  className="text-xs md:text-sm p-2 border border-gray-300 rounded w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-900 p-4 bg-white">
            <div className="bg-white p-6 md:p-8 rounded-2xl max-w-md text-center">
              <AiOutlineMessage className="text-orange-500 text-4xl md:text-5xl mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-bold text-gray-700 mb-2">Welcome to Chat</h3>
              <p className="text-gray-600 text-sm md:text-base mb-6">
                Select a seller from the list to start messaging or view your conversation history
              </p>
              <button
                onClick={() => setShowSidebar(true)}
                className="bottom-6 right-6 shadow-l md:hidden font-semibold px-4 py-2 bg-orange-600 text-white rounded-md mb-4 hover:bg-indigo-700 transition-colors"
              >
                Sellect seller
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
        .typing-dots div {
          animation-duration: 1.4s;
          animation-iteration-count: infinite;
          animation-name: bounce;
          animation-timing-function: ease-in-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

export default Chat;