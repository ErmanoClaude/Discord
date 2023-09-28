import { useEffect, useState } from "react";
import '../pages/pagesCSS/friendList.css'

function FriendList() {
    // Friends includes friends request that are pending 
    const [friends, setFriends] = useState([]);
    const [accepted, setAccepted] = useState([]);
    const [pending, setPending] = useState([]);

    useEffect(() => {
        async function fetchFriends() {
            const res = await fetch('/friends', {
                method: 'GET',
                headers: {
                    'x-access-token': localStorage.getItem('token')
                },
            });
            const data = await res.json();
            console.log(data.friends);
            setFriends(data.friends);
            const accept = [];
            const pend = [];
            for(let friend of friends) {
                if(friend.status === 'pending'){
                    pend.push(friend)
                } else {
                    accept.push(friend)
                }
            }
            setAccepted(accept);
            setPending(pend);
        };
        fetchFriends();
    }, [])

    return (
        <>
            <h1>FriendList</h1>
        </>

    )

}

export default FriendList;