import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';
import './Party.css';
import api from "../api";

const Party = () => {
    const { isLogin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);
    const [loginId, setLoginId]=useState(null);

    const [post, setPost] = useState({});
    const [images, setImages] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isOrganizer, setIsOrganizer] = useState(false);
    const postId = location.state ? location.state.postId : undefined;
    // 수정된 정보들
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editDate, setEditDate] = useState('');
    const [addTags, setAddTags] = useState([]);
    const [removeTags, setRemoveTags] = useState([]);
    const [removeImages, setRemoveImages] = useState([]);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const response = await api.get("http://localhost:8090/getloginuser", {
                    withCredentials: true
                });
                setUserId(response.data.user_id);
                setLoginId(response.data.login_id);
                console.log("userId: ", userId);
                console.log("loginId: ", loginId);
            } catch (error) {
                console.error("사용자 확인 오류:", error);
            }
        };

        if (isLogin) {
            fetchUserId();
        }
    }, []);


    useEffect(() => {
        console.log('userId: ',userId);
        console.log('postId: ', postId);

        if (postId) {
            fetchPostDetails();
        }
    }, [postId]);

    const fetchPostDetails = async () => {
        try {
            const response = await api.get(`/posts/${postId}`);
            if (response.status === 200) {
                setPost(response.data.post_response);
                setImages(response.data.paged_image_response_list.content);
                setComments(response.data.paged_comment_response_list.content);
                fetchParticipants();

                // 현재 사용자가 게시글 작성자인지 확인
                if (response.data.post_response.user_dto.user_id) {
                    setIsOrganizer(true);
                } else {
                    setIsOrganizer(false);
                }
            }
        } catch (error) {
            console.error('게시물 정보 에러:', error);
        }
    };

    const fetchParticipants = async () => {
        try {
            const response = await api.get(`/posts/${postId}/participant`);
            if (response.status === 200) {
                setParticipants(response.data);
            }
        } catch (error) {
            console.error('참가 에러:', error);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await api.get(`/posts/${postId}/comments`);
            if (response.status === 200) {
                setComments(response.data.content);
            }
        } catch (error) {
            console.error('댓글 에러:', error);
        }
    };

    const handleJoin = async () => {
        try {
            const response = await api.post(`/posts/${postId}/participant`,{},{
                withCredentials: true
            });
            if (response.status === 200) {
                fetchParticipants();
            }
        } catch (error) {
            console.error('모임 참가 에러:', error);
        }
    };

    const handleLeave = async () => {
        try {
            const response = await api.post(`/posts/${postId}/leave`,{},{
                withCredentials: true
            });
            if (response.status === 200) {
                fetchParticipants();
            }
        } catch (error) {
            console.error('모임 떠나기 에러:', error);
        }
    };

    const handleManage = () => {
        navigate('/manage');
    };

    const handleAddComment = async () => {
        try {
            const response = await api.post(`/posts/${postId}/comments`, {
                contents: newComment,
            }, { withCredentials: true });
            if (response.status === 200) {
                setNewComment('');
                fetchComments();
            }
        } catch (error) {
            console.error('댓글 추가 에러:', error);
        }
    };

    const handleEditPost = async () => {
        const updatedPost = {
            title: editTitle,
            content: editContent,
            start_time: new Date(editDate).toISOString(),
            add_tags: addTags,
            remove_tags: removeTags,
            remove_images: removeImages,
        };

        try {
            const response = await api.post(`/posts/${postId}/edit`, updatedPost, { withCredentials: true });
            if (response.status === 200) {
                setIsEditing(false);
                fetchPostDetails();
            }
        } catch (error) {
            console.error('게시물 수정 에러:', error);
        }
    };
    const handleParticipantClick = (participantId) => {
        navigate('/profile',{state: {participantId}});
    };
    const handleEditClick = () => {
        setEditTitle(post.title);
        setEditContent(post.content);
        setEditDate(post.start_time);
        setIsEditing(true);
    };

    return (
        <div className="party-container">
            <div className="party-details">
                {isEditing ? (
                    <div className="edit-form">
                        <h1>게시글 수정</h1>
                        <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="제목" />
                        <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} placeholder="내용" />
                        <input type="datetime-local" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                        <input type="text" value={addTags} onChange={(e) => setAddTags(e.target.value)} placeholder="추가할 해시태그 (공백으로 구분)" />
                        <input type="text" value={removeTags} onChange={(e) => setRemoveTags(e.target.value)} placeholder="삭제할 해시태그 (공백으로 구분)" />
                        <input type="text" value={removeImages} onChange={(e) => setRemoveImages(e.target.value)} placeholder="삭제할 이미지 ID (쉼표로 구분)" />
                        <button onClick={handleEditPost}>수정 완료</button>
                        <button onClick={() => setIsEditing(false)}>취소</button>
                    </div>
                ) : (
                    <>
                        <h1>{post.title}</h1>
                        <div className="party-info">
                            <p><strong>일시:</strong> {new Date(post.start_time).toLocaleString()}</p>
                            <p><strong>해시태그:</strong> {Array.isArray(post.hash_list) ? post.hash_list.join(', ') : ''}</p>
                            {images.length > 0 && images.map(image => (
                                <img key={image.url} src={`${process.env.PUBLIC_URL}/postImage/${image.url}`} alt={post.title} className="party-thumbnail" />
                            ))}
                            <p>{post.content}</p>
                        </div>
                        {isOrganizer && <button onClick={handleEditClick}>게시글 수정</button>}
                    </>
                )}
            </div>
            <div className="party-participants">
                <h2>참가자 명단</h2>
                <ul>
                    {participants.map((participant, index) => (
                        <li key={index} onClick={() => handleParticipantClick(participant.login_id)}>{participant.nickname}</li>
                    ))}
                </ul>
                {isLogin && (
                    <>
                        <button onClick={handleJoin}>참가</button>
                        <button onClick={handleLeave}>탈퇴</button>
                    </>
                )}
                {isOrganizer && <button onClick={handleManage}>관리</button>}
            </div>
            <div className="party-comments">
                <h2>댓글</h2>
                <ul>
                    {comments.map((comment, index) => (
                        <li key={index}>
                            <p><strong>{comment.user_dto.nickname}:</strong> {comment.content}</p>
                            <p>{new Date(comment.created_at).toLocaleString()}</p>
                        </li>
                    ))}
                </ul>
                {isLogin && (
                    <div className="comment-input">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="댓글을 입력하세요"
                        />
                        <button onClick={handleAddComment}>댓글 추가</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Party;
