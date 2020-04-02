import React, { Component } from 'react';
import './App.css';

class App extends Component {
  state = {
    clientId: null,
    posts: []
  };

  /**
   * Random number generator
   */
  generateRandomNumber() {
    return Math.round(1 + Math.random() * (1000 - 1));
  }

  /**
   * Client ID generator
   */
  assignClientId() {
    const clientId = this.generateRandomNumber();
    // Store clientId in local storage
    localStorage.setItem("posts.clientId", clientId);

    return clientId;
  }

  /**
   * Retrieves the post data from either local storage or remote API
   */
  retrievePostsData() {
    const postsData = localStorage.getItem("posts.data");

    if (!postsData) {
      /**
       * We perform two fetch calls to retrieve the posts data first,
       * followed by the users data, and then we combined the two as
       * one 'posts' array.
       */
      fetch('https://jsonplaceholder.typicode.com/posts')
        .then(res => res.json())
        .then(data => {
          /**
           * We create a placeholder object for 'address' so that the initial
           * render of the page doesn't fail due to the absence of 'city'
           * from the posts data. The actual data is retrieved in a
           * subsequent call after the data in this call saved in the state.
           */
          const location = { address: { city: "" } }; 
          const posts = [];

          // Build the augmented posts data
          for (let i = 0; i < data.length; i++) {
            posts.push({
              ...data[i],
              ...location  
            });
          }

          // Save to the state then retrieve the users data
          this.setState({ posts }, () => {
            fetch('https://jsonplaceholder.typicode.com/users')
              .then(res => res.json())
              .then(usersData => {
                const postUsersData = [];
                const postsData = this.state.posts;

                // Now we're ready to merge the posts data with users data
                for (let i = 0; i < postsData.length; i++) {
                  postUsersData.push({
                    ...postsData[i], 
                    ...usersData.find((itmInner) => itmInner.id === postsData[i].userId)
                  });
                }
                this.setState({ posts: postUsersData });
                // Save post-users data to local storage
                localStorage.setItem("posts.data", JSON.stringify(postUsersData));
              })
              .catch(err => console.log(err));
          });
        })
        .catch(err => console.log(err));
    } else {
      this.setState({ posts: JSON.parse(postsData) });
    }
  }

  componentDidMount() {
    /**
     * Check if client ID exists in local storage.  Otherwise,
     * assign a new client ID
     */
    const clientId = localStorage.getItem("posts.clientId") || this.assignClientId();

    this.setState({ clientId });
    this.retrievePostsData();
  }

  componentWillUnmount() {
    this.setState({ posts: []});
  }

  render() {
    return (
      <div className="App">
        <div className="headline">Client ID: { this.state.clientId } - Posts</div>
        <table className="posts-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Body</th>
              <th>Created by</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            { this.state.posts.map((post, idx) => (
              <tr key={idx}>
                <td>{post.title}</td>
                <td>{post.body}</td>
                <td>{post.username}</td>
                <td>{post.address.city}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default App;
