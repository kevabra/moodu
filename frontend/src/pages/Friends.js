import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Friends.css'; // For custom styles

const Friends = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [matchingUsers, setMatchingUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [pendingRequests, setPendingRequests] = useState([]);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [isUserSelected, setIsUserSelected] = useState(false); // Track if a user is selected
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const [friendList, setFriendList] = useState([]);

    
    const fetchFriendList = async () => {
      try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/mood/friends`, {
            headers: { Authorization: token }
        });
          setFriendList(response.data);
      } catch (error) {
          console.error('Error fetching users', error);
      }
    };
    
    useEffect(() => {
        fetchFriendList();
    }, []);

    // Filter users to display only those whose moodSetting is not "private" and user in friend list
    const friend_users = friendList.filter(friend_user => /*user.latestMood &&*/ friend_user.moodSetting !== 'private');

    // Fetch matching usernames when searchTerm changes
    useEffect(() => {
        if (searchTerm && !isUserSelected) {
            axios.get(`${process.env.REACT_APP_API_URL}/mood/users`)
            .then(response => {
                let users = response.data;
                let friend_list = friendList.map(item => item._id);
                let matched = users.filter(user => user.username.includes(searchTerm) && user._id != userId && !friend_list.includes(user._id));
                setMatchingUsers(matched);
            }).catch(error => {
                console.error('Error fetching users', error);
            });
        } else {
            setMatchingUsers([]);
        }
    }, [searchTerm, isUserSelected, token]);

    // Fetch pending friend requests
    const fetchPendingRequests = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/mood/friends/requests?status=pending`, {
                headers: { Authorization: token }
            });
            setPendingRequests(response.data.filter(request => request.recipient && request.requester));
        } catch (error) {
            console.error('Error fetching pending requests:', error);
        }
    };

    // Fetch pending friend requests on page load
    useEffect(() => {
        if (token) {
            fetchPendingRequests();
        }
    }, [token]);

    // Handle sending friend request
    const sendFriendRequest = () => {
      if (selectedUser) {
          axios.post(`${process.env.REACT_APP_API_URL}/mood/friends/request`, {
              recipientId: selectedUser._id
          }, {
              headers: { Authorization: token }
          }).then(response => {
              setSuccess('Friend request sent!');
              setError('');
              fetchPendingRequests(); // Refetch pending requests after sending the request
          }).catch(error => {
              if (error.response && error.response.status === 400) {
                  const errorMessage = error.response.data.message;
                  setError(errorMessage); // Display the specific error message returned by the server
                  setSuccess('');
              } else {
                  setError('Error sending friend request');
                  setSuccess('');
              }
          });
      }
    };

    // Handle accepting friend request
    const acceptFriendRequest = (requestId, requester, recipient) => {
        axios.put(`${process.env.REACT_APP_API_URL}/mood/friends/request/accept`, {
            requestId
        }, {
            headers: { Authorization: token }
        }).then(response => {
            setSuccess('Friend request accepted!');
            setError('');
            fetchPendingRequests(); // Refetch the pending requests
        }).catch(error => {
            setError('Error accepting friend request');
            setSuccess('');
        });

        axios.post(`${process.env.REACT_APP_API_URL}/mood/friends/${requester._id}`, {}, {
           headers: { Authorization: token }
        }).then(response => {
            setSuccess('Friend successfully added!');
            setError('');
            fetchFriendList();
        }).catch(error => {
            setError('Error adding friend');
            setSuccess('')
        })
    };

    // Handle rejecting friend request
    const rejectFriendRequest = (requestId) => {
        axios.delete(`${process.env.REACT_APP_API_URL}/mood/friends/request/reject`, {
            data: { requestId },
            headers: { Authorization: token }
        }).then(response => {
            setSuccess('Friend request rejected.');
            setError('');
            fetchPendingRequests(); // Refetch the pending requests
        }).catch(error => {
            setError('Error rejecting friend request');
            setSuccess('');
        });
    };

    return (
        <div className="friends-page container my-4">
            <h1>Friends</h1>
            {/* Search and Send Friend Request Section */}
            <div className="friend-search card p-3 mb-4">
                <h5 className="card-title">Search for Friends</h5>
                <div className="input-group">
                    <input 
                        type="text" 
                        className="form-control" 
                        value={isUserSelected ? selectedUser.username : searchTerm} 
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsUserSelected(false); // Allow editing once input is changed
                        }} 
                        placeholder="Search for users by username..." 
                    />
                    <button
                        onClick={sendFriendRequest}
                        disabled={!selectedUser}
                    >
                        Send Request
                    </button>
                </div>

                {/* Display matching usernames */}
                {matchingUsers.length > 0 && (
                    <ul className="list-group">
                        {matchingUsers.map((user, index) => (
                            <li 
                                key={index} 
                                className="list-group-item list-group-item-action" 
                                onClick={() => {
                                    setSearchTerm(user.username); // Populate the search field with the selected username
                                    setSelectedUser(user);
                                    setIsUserSelected(true); // Lock the input field once a user is selected
                                }}
                            >
                                {user.username}
                            </li>
                        ))}
                    </ul>
                )}

                {error && <p className="error text-danger">{error}</p>}
                {success && <p className="success text-success">{success}</p>}
            </div>

            {/* Display pending friend requests */}
            <div className="pending-requests card p-3">
                <h5 className="card-title">Pending Friend Requests</h5>
                {pendingRequests.length > 0 ? (
                    <ul className="list-group pending-requests-list">
                        {pendingRequests.map((request, index) => (
                            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                {request.requester._id !== userId && (
                                    <>
                                        <span><strong>{request.requester.username}</strong> has sent you a friend request.</span>
                                        <div>
                                            <button className="btn btn-success me-2" onClick={() => acceptFriendRequest(request._id, request.requester, request.recipient)}>Yes</button>
                                            <button className="btn btn-danger" onClick={() => rejectFriendRequest(request._id)}>No</button>
                                        </div>
                                    </>
                                )}
                                {request.requester._id === userId && request.recipient && (
                                    <span>You sent <strong>{request.recipient.username}</strong> a friend request.</span>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted">No pending requests.</p>
                )}
            </div>
            <div className="users-container">
                <div className="user-list">
                    {friend_users.length > 0 ? (
                        friend_users.map((friend_user, index) => (
                            <div className="user-card" key={index}>
                                <h3>{friend_user.username}</h3>
                                {friend_user.latestMood ? (
                                    <p><strong>Latest Mood:</strong> {friend_user.latestMood.mood}</p>
                                ) : (
                                    <p>No mood message posted yet.</p>
                                )}
                                {friend_user.latestMood && (
                                    <p><strong>Message:</strong> {friend_user.latestMood.message}</p>
                                )}
                                {friend_user.latestMood && (
                                    <p><i>{new Date(friend_user.latestMood.date).toLocaleDateString()}</i></p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No users found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Friends;
