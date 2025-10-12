import React, { useEffect, useState } from "react";
import profilePic from "../../assets/images/ProfilePic.jpg";
import "./Header.css";

const Header = () => {
  const [dataTime, setDataTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setDataTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const pad = (num) => String(num).padStart(2, "0");

  return (
    <header>
      <h1>Alelover's Personal Hub</h1>

      <div className="right-header">
        {/* SIGNBOARD */}
        <div className="signboard-container">
          <div className="signboard outer">
            <div className="signboard front inner anim04c">
              <li className="year anim04c">
                <span>{dataTime.getFullYear()}</span>
              </li>

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

              <li className="clock minute anim04c">
                <span>{pad(dataTime.getMinutes())}</span>
              </li>
              <li className="calendarNormal date2 anim04c">
                <span>{dataTime.getDate()}</span>
              </li>
            </div>

            <div className="signboard left inner anim04c">
              <li className="clock hour anim04c">
                <span>{pad(dataTime.getHours())}</span>
              </li>
              <li className="calendarNormal day2 anim04c">
                <span>{dayNames[dataTime.getDay()]}</span>
              </li>
            </div>

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

        {/* PROFILE PIC */}
        <img src={profilePic} alt="Person of the profile of the people using it" className="profile-pic" />
      </div>
    </header>
  );
};

export default Header;