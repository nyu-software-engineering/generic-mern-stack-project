import { Link } from "react-router"
import './Header.css'

export default function Header(){
    return (
        <header className='site-header'>
        <strong>
          CampusMart
        </strong>
        <span>
          NYU
        </span>
        <Link to='/profile'>
          Account
        </Link>
      </header>
    )
}