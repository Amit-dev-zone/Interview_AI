import { createBrowserRouter } from "react-router"
import Register from "./features/auth/pages/Register"
import Login from "./features/auth/pages/Login"
import Home from "./features/auth/pages/Home"
import ResumePlanner from "./features/plan/pages/ResumePlanner"
import InterviewRoom from "./features/interview/pages/InterviewRoom"
import InterviewHistory from "./features/interview/pages/InterviewHistory"

export const router = createBrowserRouter([ 
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/plan",
    element: <ResumePlanner />
  },
  {
    path: "/interview/new",
    element: <InterviewRoom />
  },
  {
    path: "/interview/:id",
    element: <InterviewRoom />
  },
  {
    path: "/interview/history",
    element: <InterviewHistory />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/login",
    element: <Login />
  }
])
