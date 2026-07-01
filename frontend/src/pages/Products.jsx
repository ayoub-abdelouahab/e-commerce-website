import { useAuth } from "../context/AuthContext";
import "../styles/Products.css";

const Products = () => {

    const { user, logout } = useAuth();

    return (
        <div className="products-page">

            <nav className="navbar">
                <div className="logo">MyShop</div>

                <button
                    className="logout-btn"
                    onClick={logout}
                >
                    Logout
                </button>
            </nav>

            <div className="hero">

                <h1>Welcome {user?.name} 👋</h1>

                <p>
                    Logged in as <strong>{user?.role}</strong>
                </p>

                <div className="cards">

                    <div className="card">
                        <h3>Electronics</h3>
                        <p>Latest gadgets and accessories.</p>
                    </div>

                    <div className="card">
                        <h3>Fashion</h3>
                        <p>Trending styles for everyone.</p>
                    </div>

                    <div className="card">
                        <h3>Home</h3>
                        <p>Everything for your home.</p>
                    </div>

                </div>

            </div>

        </div>
    );
};

export default Products;