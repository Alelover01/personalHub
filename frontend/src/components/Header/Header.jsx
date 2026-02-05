import React, { useEffect, useState } from "react";
import profilePic from "../../assets/images/ProfilePic.jpg";
import "./Header.css";
/**
 * Header Component
 * Dispalys the application header with:
 * - Dynamic user greeting (username from localStorage)
 * - Interactive 3D signboard showing current date/time 
 * - User profile picture (from database or default)
 * 
 * The signboard features a flip animation on click to show time details.
 * @returns 
 */
const Header = () => {
  //State for the current date/time (updates every second)
  const [dataTime, setDataTime] = useState(new Date());
  
  //State for user data loaded from localStorage
  const [user, setUser] = useState(null);
  //Deafault profile picture fallback
  const defaultProfilePic = profilePic;

  /**
   * Effect: Update current time every second
   * Sets up an interval that updates dataTime state
   * Cleanup function clears interval on component unmount
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setDataTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  /**
   * Effect: Load user data from localStorage on mount
   * Retrives and parses user object stored after login/registartion 
   * Handle parsing errors
   */
  useEffect(() =>{
    const storedUser = localStorage.getItem('user');
    if (storedUser){
      try{
        setUser(JSON.parse(storedUser));
      } catch (err){
        console.error('Error in the parsing of the user data:', err);
      }
    }
  }, []);

  /** Array of month names for display */
  const monthNames = [
    "January","February","March","April","May","June","July",
    "August","September","October","November","December",
  ];
  //** Array of day names for display */
  const dayNames = [
    "Sunday","Monday","Tuesday","Wednesday","Thursday",
    "Friday","Saturday",
  ];

   /**
   * Utility funcion to pad numbers with leading zero
   * @param {number} num - Numeber to pad (0-59 for time)
   * @returns {string} Padded string (ex. "09" for 9)
   */
  const pad = (num) => String(num).padStart(2, "0");
   /**
   * Determinate which profile picture to display
   * Priority: users's uploaded picture over the default one
   */
  const profilePicture = user?.profilePicture || defaultProfilePic;
   /**
   * Determinate which username to display
   * Shows Guest if no user is logged in
   */
  const username = user?.username || "Guest";

  return (
    <header>
      {/* Dynamic greeting with username */}
      <h1>{username}'s Personal Hub</h1>

      <div className="right-header">
        {/* SIGNBOARD : 3D interactive date/time display*/}
        <div className="signboard-container">
          <div className="signboard outer">
            {/* Front face: Shows date in calendar format */}
            <div className="signboard front inner anim04c">
              {/* Year (hidden by default, shown on click) */}
              <li className="year anim04c">
                <span>{dataTime.getFullYear()}</span>
              </li>
              {/* Main calendar display */}
              <ul className="calendarMain anim04c">
                <li className="month anim04c">
                  <span>{monthNames[dataTime.getMonth()]}</span>
                </li>
                <li className="date anim04c">
                  <span>{dataTime.getDate()}</span>
                </li>
                <li className="day anim04c">
                  <span>{dayNames[dataTime.getDay()]}</span>
                </li>
              </ul>
              {/* Minutes (hidden by default, shown on click) */}
              <li className="clock minute anim04c">
                <span>{pad(dataTime.getMinutes())}</span>
              </li>
              {/* Date number (shown on click) */}
              <li className="calendarNormal date2 anim04c">
                <span>{dataTime.getDate()}</span>
              </li>
            </div>
            {/* Left face: Shows hours */}
            <div className="signboard left inner anim04c">
              <li className="clock hour anim04c">
                <span>{pad(dataTime.getHours())}</span>
              </li>
              <li className="calendarNormal day2 anim04c">
                <span>{dayNames[dataTime.getDay()]}</span>
              </li>
            </div>
            {/*Right face: Shows seconds */}
            <div className="signboard right inner anim04c">
              <li className="clock second anim04c">
                <span>{pad(dataTime.getSeconds())}</span>
              </li>
              <li className="calendarNormal month2 anim04c">
                <span>{monthNames[dataTime.getMonth()]}</span>
              </li>
            </div>
          </div>
        </div>

        {/* PROFILE PICTURE: User avatar with fallback */}
        <img 
          src={profilePicture} 
          alt="Person of the profile of the people using it" 
          className="profile-pic"
          onError={(e)=>{
            //Fallback to default if image fails to load
            e.target.src = defaultProfilePic;
          }}
          />
      </div>
    </header>
  );
};

export default Header;