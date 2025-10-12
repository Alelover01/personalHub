import {Link} from "react-router-dom";
import "./Navbar.css";

export default function Navbar(){
    const links = [
        "Home",
        "Travel-Plans",
        "Financial-Balance",
        "Books",
        "TV-Series",
        "Manhwa",
        "Shopping-List",
        "Games",
        "Sites",
        "Anime"
    ];

    return(
        //TO-DO farlo più dinamico
        <nav>
            <ul>
                {links.map((text) =>(
                    <li key={text}>
                        <Link to={`/${text.toLowerCase().replace(/\s+/g, "-")}`}>{text}</Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}