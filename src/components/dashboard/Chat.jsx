import React, { useEffect, useState, useRef } from 'react';
import { AiOutlineMessage, AiOutlinePlus } from 'react-icons/ai';
import { GrEmoji } from 'react-icons/gr';
import { IoSend } from 'react-icons/io5';
import { FaList, FaTimes } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AddCommentIcon from '@mui/icons-material/AddComment';
import io from 'socket.io-client';
import { add_friend, send_message, updateMessage, messageClear } from '../../store/reducers/chatReducer';
import toast from 'react-hot-toast';
import { api_url } from '../../utils/config';

const socket = io(api_url);

const Chat = () => {
    const scrollRef = useRef();
    const dispatch = useDispatch();
    const { sellerId } = useParams();
    const [text, setText] = useState('');
    const [receverMessage, setReceverMessage] = useState('');
    const [activeSeller, setActiveSeller] = useState([]);
    const { userInfo } = useSelector(state => state.auth);
    const { fd_messages, currentFd, my_friends, successMessage } = useSelector(state => state.chat);
    const [showSidebar, setShowSidebar] = useState(false);

    useEffect(() => {
        socket.emit('add_user', userInfo.id, userInfo);
    }, []);

    useEffect(() => {
        dispatch(add_friend({
            sellerId: sellerId || "",
            userId: userInfo.id
        }));
    }, [sellerId]);

    const send = () => {
        if (text.trim()) {
            dispatch(send_message({
                userId: userInfo.id,
                text,
                sellerId,
                name: userInfo.name
            }));
            setText('');
        }
    };

    useEffect(() => {
        socket.on('seller_message', msg => {
            setReceverMessage(msg);
        });
        socket.on('activeSeller', (sellers) => {
            setActiveSeller(sellers);
        });

        return () => {
            socket.off('seller_message');
            socket.off('activeSeller');
        };
    }, []);

    useEffect(() => {
        if (successMessage) {
            socket.emit('send_customer_message', fd_messages[fd_messages.length - 1]);
            dispatch(messageClear());
        }
    }, [successMessage]);

    useEffect(() => {
        if (receverMessage) {
            if (sellerId === receverMessage.senderId && userInfo.id === receverMessage.receverId) {
                dispatch(updateMessage(receverMessage));
            } else {
                toast.success(receverMessage.senderName + " sent a message");
                dispatch(messageClear());
            }
        }
    }, [receverMessage]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [fd_messages]);

    return (
        <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-120px)] md:h-[600px] overflow-hidden">
            <div className="flex h-full relative">
                {/* Seller List Sidebar */}
                <div className={`w-80 bg-white border-r transition-all duration-300 fixed md:relative z-20 md:z-0 h-full ${showSidebar ? 'left-0' : '-left-full md:left-0'}`}>
                    <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <AiOutlineMessage className="text-orange-600" />
                            Chat
                        </h2>
                        <button
                            onClick={() => setShowSidebar(false)}
                            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <FaTimes className="text-gray-600" />
                        </button>
                    </div>
                    <div className="overflow-y-auto h-[calc(100%-60px)]">
                        {my_friends.length > 0 ? (
                            my_friends.map((f, i) => (
                                <Link
                                    to={`/dashboard/chat/${f.fdId}`}
                                    key={i}
                                    className={`flex items-center p-3 hover:bg-blue-50 transition-colors ${currentFd?.fdId === f.fdId ? 'bg-blue-50 border-r-2 border-blue-500' : ''}`}
                                    onClick={() => setShowSidebar(false)}
                                >
                                    <div className="relative mr-3">
                                        <img
                                            src={f.image || "/images/user.png"}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                            alt={f.name}
                                        />
                                        {activeSeller.some(c => c.sellerId === f.fdId) && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-800 truncate">{f.name}</h3>
                                        <p className="text-sm text-gray-500 truncate">
                                            {activeSeller.some(c => c.sellerId === f.fdId) ? "Online" : "Offline"}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="p-4 text-center h-[100%] flex justify-center items-cnetr text-indigo-500">
                                No Seller on the list yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Main Area */}
                <div className="flex-1 flex flex-col relative md:ml-0">
                    {currentFd ? (
                        <>
                            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowSidebar(true)}
                                        className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <FaList className="text-gray-600" />
                                    </button>
                                    <div className="relative">
                                        <img
                                            src={currentFd.image || "/images/user.png"}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                            alt={currentFd.name}
                                        />
                                        {activeSeller.some(c => c.sellerId === currentFd.fdId) && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-gray-800">{currentFd.name}</h2>
                                        <p className="text-sm text-gray-500">
                                            {activeSeller.some(c => c.sellerId === currentFd.fdId) ? "Online" : "Offline"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p- bg-gray-100/50">
                                <div className="flex flex-col gap-4 p-2">
                                    {fd_messages.length > 0 ? (
                                        fd_messages.map((m, i) => (
                                            <div
                                                key={i}
                                                ref={i === fd_messages.length - 1 ? scrollRef : null}
                                                className={`flex ${currentFd?.fdId !== m.receverId ? 'justify-start' : 'justify-end'}`}
                                            >
                                                {/* Message Container */}
                                                <div className={`max-w-[85%] flex gap-3 ${currentFd?.fdId !== m.receverId ? 'flex-row' : 'flex-row-reverse'}`}>
                                                    {/* Avatar */}
                                                    
                                                    {/* Message Bubble */}
                                                    <div className={`p-3 rounded-xl border ${currentFd?.fdId !== m.receverId
                                                        ? 'bg-white border-gray-200 rounded-tl-none'
                                                        : 'bg-blue-50 border-blue-100 rounded-tr-none'
                                                        } shadow-sm`}>
                                                        <div className="flex flex-col gap-1">
                                                            <p className="text-gray-800 text-sm font-medium">{m.message}</p>
                                                            <div className="flex items-center justify-end gap-2">
                                                                <span className="text-xs text-gray-400">
                                                                    {new Date(m.time).toLocaleTimeString([], {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </span>
                                                                {currentFd?.fdId === m.receverId && (
                                                                    <span className="text-xs text-blue-500">
                                                                        ✓✓
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full py-8 space-y-4">
                                            <svg
                                                className="w-24 h-24 text-gray-300"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                                />
                                            </svg>
                                            <p className="text-gray-400 text-lg font-medium">
                                                No messages yet
                                            </p>
                                            <p className="text-gray-400 text-sm">
                                                Start a conversation with your seller
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 border-t bg-white">
                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
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
                                            className="w-full p-3 pr-12 border rounded-full focus:outline-none focus:border-blue-500"
                                            onKeyPress={(e) => e.key === 'Enter' && send()}
                                        />
                                        <button className="absolute right-3 top-3 text-gray-500 hover:text-blue-600">
                                            <GrEmoji className="text-xl" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={send}
                                        disabled={!text.trim()}
                                        className={`p-3 rounded-full transition-colors ${text.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                    >
                                        <IoSend className="text-xl" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-4">
                            <button
                                onClick={() => setShowSidebar(true)}
                                className="absolute bottom-5 right-3 shadow-sm md:hidden p-4 bg-[#191919] p-2 text-white rounded-xl mb-4"
                            >
                                <AddCommentIcon className="text-2xl" />
                            </button>
                            <AiOutlineMessage className="text-4xl mb-4" />
                            <p className="text-lg text-center">Select a seller to start chatting</p>
                            <p className="text-sm mt-2 text-center">Or start a new conversation with a seller</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;