import { useContext } from "react"
import { AuthContext } from "../auth.context.jsx"
import { login, logout, register, getMe } from "../services/auth.api.js"

export const useAuth = () => {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }

    const { user, loading, setUser, setLoading } = context

    const handleLogin = async (emailOrPayload, maybePassword) => {
        let email, password;
        if (typeof emailOrPayload === "object" && emailOrPayload !== null) {
            email = emailOrPayload.email;
            password = emailOrPayload.password;
        } else {
            email = emailOrPayload;
            password = maybePassword;
        }

        setLoading(true)
        try {
            const data = await login(email, password)
            if (data?.user) {
                setUser(data.user)
            }
            return data
        } catch (e) {
            console.error("Error logging in:", e)
            throw e
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (usernameOrPayload, maybeEmail, maybePassword) => {
        let username, email, password;
        if (typeof usernameOrPayload === "object" && usernameOrPayload !== null) {
            username = usernameOrPayload.username;
            email = usernameOrPayload.email;
            password = usernameOrPayload.password;
        } else {
            username = usernameOrPayload;
            email = maybeEmail;
            password = maybePassword;
        }

        setLoading(true)
        try {
            const data = await register(username, email, password)
            if (data?.user) {
                setUser(data.user)
            }
            return data
        } catch (e) {
            console.error("Error registering:", e)
            throw e
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
        } catch (e) {
            console.error("Error logging out:", e)
            throw e
        } finally {
            setLoading(false)
        }
    }

    return { user, loading, handleLogin, handleRegister, handleLogout, setUser, setLoading };
}