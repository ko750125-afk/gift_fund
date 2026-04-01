import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 대표님, 이곳에 Firebase 설정값이 들어있습니다. 
// 보안을 위해 실제 서비스 시에는 환경변수(.env)로 관리하는 것이 좋지만, 
// 현재는 바로 실행하실 수 있도록 직접 포함해 두었습니다.
const firebaseConfig = {
  apiKey: "AIzaSyDGlcpvw4zTeNJKSG1YiTYregI8B4VyfzM",
  authDomain: "gen-lang-client-0701799372.firebaseapp.com",
  projectId: "gen-lang-client-0701799372",
  storageBucket: "gen-lang-client-0701799372.firebasestorage.app",
  messagingSenderId: "198841776420",
  appId: "1:198841776420:web:6de767dba8d16d1ff95bb1",
  measurementId: "G-XPTP1QV3ZT"
};

// 중복 초기화를 방지하기 위한 로직입니다.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
