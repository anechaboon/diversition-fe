import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Home from './pages/Home.jsx';
import PostPage from './pages/PostPage.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home/>,
  },
  {
    path: "/upload",
    element: <PostPage/>,
  },
// ส่วนของ path และ element เราสามารถเพิ่มมาอีกได้เรื่อย ๆ กรณีที่เรามีหลายเพจ
]);


ReactDOM.createRoot(document.getElementById("root")).render(

    <RouterProvider router={router} />

);