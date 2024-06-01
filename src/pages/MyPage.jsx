// 내정보(프로필) 페이지
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import axios from "axios";
import "./MyPage.css";

const MyPage = () => {
    const { isLogin, logout, userId } = useAuth();
    const navigate = useNavigate();

    const [nickname, setNickname] = useState('');
    const [introduction, setIntroduction] = useState('');
    const [email, setEmail] = useState('');
    const [score, setScore] = useState(0);
    const [hashtags, setHashtags] = useState([]);
    const [templates, setTemplates] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`http://localhost:8090/profile/${userId}`, { withCredentials: true });
                const data = response.data;
                setNickname(data.nickname);
                setIntroduction(data.introduction);
                setEmail(data.email);
                setScore(data.score);
                setHashtags(data.hash_names);
                setTemplates(data.template_names);
            } catch (error) {
                console.error("정보 가져오기 에러:", error);
            }
        };

        if (isLogin) {
            fetchUserData();
        } else {
            navigate('/login');
        }
    }, [isLogin, navigate, userId]);

    const handleDeleteAccount = async () => {
        try {
            const response = await axios.delete(`http://localhost:8090/profile/${userId}`, { withCredentials: true });
            if (response.status === 200) {
                alert('회원탈퇴가 완료되었습니다');
                logout();
                navigate('/');
            } else {
                alert('회원탈퇴 실패.');
            }
        } catch (error) {
            console.error("회원탈퇴 에러:", error);
        }
    };

    return (
        <div className="mypageContainer">
            <h1>{nickname} 님의 마이페이지 입니다</h1>

            <div className="introductionContainer">
                <label>자기소개</label>
                <div className="introductionInput">
                    <input
                        type="text"
                        value={introduction}
                        readOnly
                        placeholder="자기소개를 한줄로 작성하세요"
                    />
                </div>
            </div>

            <div className="emailContainer">
                <label>이메일</label>
                <div className="emailInput">
                    <input
                        type="text"
                        value={email}
                        readOnly
                        placeholder="이메일"
                    />
                </div>
            </div>

            <div className="mannerScore">
                <h3>매너 점수</h3>
                <div className="mannerFigure">
                    <div className="mannerFill" style={{ width: `${score}%` }}>
                        {score}%
                    </div>
                </div>
            </div>

            <div className="hashtagContainer">
                <label>해쉬 태그</label>
                <div className="hashtagInput">
                    {hashtags.map((tag, index) => (
                        <input
                            key={index}
                            type="text"
                            value={tag}
                            readOnly
                            placeholder="해쉬태그를 입력하세요"
                        />
                    ))}
                </div>
            </div>

            <div className="templateContainer">
                <label>템플릿</label>
                <div className="templateInput">
                    {templates.map((template, index) => (
                        <input
                            key={index}
                            type="text"
                            value={template}
                            readOnly
                            placeholder="템플릿을 입력하세요"
                        />
                    ))}
                </div>
            </div>

            <div className="buttonContainer">
                <Link to="/">
                    <button>수정페이지</button>
                </Link>
                <Link to="/party">
                    <button>모임 목록</button>
                </Link>
                <button onClick={handleDeleteAccount}>회원탈퇴</button>
            </div>
        </div>
    );
};

export default MyPage;