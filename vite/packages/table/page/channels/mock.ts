const socialContractAddress = "0x98fC79649A3121d397Ef22233CB3f9712933B0F5";
const socialContractABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_commentId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_userId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_forumId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_content",
        "type": "string"
      },
      {
        "internalType": "string[]",
        "name": "_imagesCID",
        "type": "string[]"
      }
    ],
    "name": "addComment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_forumId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_userId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_content",
        "type": "string"
      },
      {
        "internalType": "string[]",
        "name": "_imagesCID",
        "type": "string[]"
      }
    ],
    "name": "postForum",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_userId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_nickname",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_avatarCID",
        "type": "string"
      }
    ],
    "name": "register",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "CommentMap",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "commentId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "userId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "forumId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "content",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "timeStamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "ForumMap",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "forumId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "userId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "content",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "timeStamp",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "likeCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "collectCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "commentCount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_commentId",
        "type": "uint256"
      }
    ],
    "name": "getCommentInfo",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "commentId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "userId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "forumId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "content",
            "type": "string"
          },
          {
            "internalType": "string[]",
            "name": "imagesCID",
            "type": "string[]"
          },
          {
            "internalType": "uint256",
            "name": "timeStamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct SocialNetwork.Comment",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_forumId",
        "type": "uint256"
      }
    ],
    "name": "getForumInfo",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "forumId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "userId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "content",
            "type": "string"
          },
          {
            "internalType": "string[]",
            "name": "imagesCID",
            "type": "string[]"
          },
          {
            "internalType": "uint256",
            "name": "timeStamp",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "likeCount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "collectCount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "commentCount",
            "type": "uint256"
          }
        ],
        "internalType": "struct SocialNetwork.Forum",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_userId",
        "type": "uint256"
      }
    ],
    "name": "getUserInfo",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "userAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "userId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "nickname",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "avatarCID",
            "type": "string"
          }
        ],
        "internalType": "struct SocialNetwork.UserInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "UserMap",
    "outputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "userId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "nickname",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "avatarCID",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
// const socialContractAddress = '0x748808dC22B0923Bc130500D9C2A9F3d02A302A5';
// const socialContractABI = [
//   {
//     "inputs": [
//       {
//         "internalType": "uint256",
//         "name": "_commentId",
//         "type": "uint256"
//       },
//       {
//         "internalType": "uint256",
//         "name": "_userId",
//         "type": "uint256"
//       },
//       {
//         "internalType": "uint256",
//         "name": "_forumId",
//         "type": "uint256"
//       },
//       {
//         "internalType": "string",
//         "name": "_content",
//         "type": "string"
//       }
//     ],
//     "name": "addComment",
//     "outputs": [],
//     "stateMutability": "nonpayable",
//     "type": "function"
//   },
//   {
//     "inputs": [
//       {
//         "internalType": "uint256",
//         "name": "_userId",
//         "type": "uint256"
//       },
//       {
//         "internalType": "uint256",
//         "name": "_forumId",
//         "type": "uint256"
//       }
//     ],
//     "name": "cancelCollectForum",
//     "outputs": [],
//     "stateMutability": "nonpayable",
//     "type": "function"
//   },
//   {
//     "inputs": [
//       {
//         "internalType": "uint256",
//         "name": "_userId",
//         "type": "uint256"
//       },
//       {
//         "internalType": "uint256",
//         "name": "_forumId",
//         "type": "uint256"
//       }
//     ],
//     "name": "cancelLikeForum",
//     "outputs": [],
//     "stateMutability": "nonpayable",
//     "type": "function"
//   },
//   {
//     "inputs": [
//       {
//         "internalType": "uint256",
//         "name": "_userId",
//         "type": "uint256"
//       },
//       {
//         "internalType": "uint256",
//         "name": "_forumId",
//         "type": "uint256"
//       }
//     ],
//     "name": "collectForum",
//     "outputs": [],
//     "stateMutability": "nonpayable",
//     "type": "function"
//   },
//   {
//     "inputs": [
//       {
//         "internalType": "uint256",
//         "name": "_userId",
//         "type": "uint256"
//       },
//       {
//         "internalType": "uint256",
//         "name": "_forumId",
//         "type": "uint256"
//       }
//     ],
//     "name": "likeForum",
//     "outputs": [],
//     "stateMutability": "nonpayable",
//     "type": "function"
//   },
//   {
//     "inputs": [
//       {
//         "internalType": "uint256",
//         "name": "_forumId",
//         "type": "uint256"
//       },
//       {
//         "internalType": "uint256",
//         "name": "_userId",
//         "type": "uint256"
//       },
//       {
//         "internalType": "string",
//         "name": "_title",
//         "type": "string"
//       },
//       {
//         "internalType": "string",
//         "name": "_content",
//         "type": "string"
//       },
//       {
//         "internalType": "string[]",
//         "name": "_imagesCID",
//         "type": "string[]"
//       }
//     ],
//     "name": "postForum",
//     "outputs": [],
//     "stateMutability": "nonpayable",
//     "type": "function"
//   },
//   {
//     "inputs": [
//       {
//         "internalType": "uint256",
//         "name": "_userId",
//         "type": "uint256"
//       },
//       {
//         "internalType": "string",
//         "name": "_nickname",
//         "type": "string"
//       },
//       {
//         "internalType": "string",
//         "name": "_avatarCID",
//         "type": "string"
//       }
//     ],
//     "name": "register",
//     "outputs": [],
//     "stateMutability": "nonpayable",
//     "type": "function"
//   },
//   {
//     "inputs": [
//       {
//         "internalType": "uint256",
//         "name": "_userId",
//         "type": "uint256"
//       },
//       {
//         "internalType": "address",
//         "name": "_userAddress",
//         "type": "address"
//       },
//       {
//         "internalType": "string",
//         "name": "_nickname",
//         "type": "string"
//       },
//       {
//         "internalType": "string",
//         "name": "_avatarCID",
//         "type": "string"
//       }
//     ],
//     "name": "updateUserInfo",
//     "outputs": [],
//     "stateMutability": "nonpayable",
//     "type": "function"
//   },
//   {
//     "inputs": [
//       {
//         "internalType": "uint256",
//         "name": "",
//         "type": "uint256"
//       }
//     ],
//     "name": "CommentMap",
//     "outputs": [
//       {
//         "internalType": "uint256",
//         "name": "commentId",
//         "type": "uint256"
//       },
//       {
//         "internalType": "uint256",
//         "name": "userId",
//         "type": "uint256"
//       },
//       {
//         "internalType": "uint256",
//         "name": "forumId",
//         "type": "uint256"
//       },
//       {
//         "internalType": "string",
//         "name": "content",
//         "type": "string"
//       },
//       {
//         "internalType": "uint256",
//         "name": "timeStamp",
//         "type": "uint256"
//       }
//     ],
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "inputs": [
//       {
//         "internalType": "uint256",
//         "name": "",
//         "type": "uint256"
//       }
//     ],
//     "name": "comments",
//     "outputs": [
//       {
//         "internalType": "uint256",
//         "name": "commentId",
//         "type": "uint256"
//       },
//       {
//         "internalType": "uint256",
//         "name": "userId",
//         "type": "uint256"
//       },
//       {
//         "internalType": "uint256",
//         "name": "forumId",
//         "type": "uint256"
//       },
//       {
//         "internalType": "string",
//         "name": "content",
//         "type": "string"
//       },
//       {
//         "internalType": "uint256",
//         "name": "timeStamp",
//         "type": "uint256"
//       }
//     ],
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "inputs": [
//       {
//         "internalType": "uint256",
//         "name": "",
//         "type": "uint256"
//       }
//     ],
//     "name": "ForumInfoMap",
//     "outputs": [
//       {
//         "internalType": "uint256",
//         "name": "forumId",
//         "type": "uint256"
//       },
//       {
//         "internalType": "uint256",
//         "name": "userId",
//         "type": "uint256"
//       }
//     ],
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "inputs": [
//       {
//         "internalType": "uint256",
//         "name": "",
//         "type": "uint256"
//       }
//     ],
//     "name": "ForumMap",
//     "outputs": [
//       {
//         "internalType": "uint256",
//         "name": "forumId",
//         "type": "uint256"
//       },
//       {
//         "internalType": "uint256",
//         "name": "userId",
//         "type": "uint256"
//       },
//       {
//         "internalType": "string",
//         "name": "title",
//         "type": "string"
//       },
//       {
//         "internalType": "string",
//         "name": "content",
//         "type": "string"
//       },
//       {
//         "internalType": "uint256",
//         "name": "timeStamp",
//         "type": "uint256"
//       },
//       {
//         "internalType": "uint256",
//         "name": "likeCount",
//         "type": "uint256"
//       },
//       {
//         "internalType": "uint256",
//         "name": "collectCount",
//         "type": "uint256"
//       },
//       {
//         "internalType": "uint256",
//         "name": "commentCount",
//         "type": "uint256"
//       }
//     ],
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "inputs": [
//       {
//         "internalType": "uint256",
//         "name": "",
//         "type": "uint256"
//       }
//     ],
//     "name": "forums",
//     "outputs": [
//       {
//         "internalType": "uint256",
//         "name": "forumId",
//         "type": "uint256"
//       },
//       {
//         "internalType": "uint256",
//         "name": "userId",
//         "type": "uint256"
//       },
//       {
//         "internalType": "string",
//         "name": "title",
//         "type": "string"
//       },
//       {
//         "internalType": "string",
//         "name": "content",
//         "type": "string"
//       },
//       {
//         "internalType": "uint256",
//         "name": "timeStamp",
//         "type": "uint256"
//       },
//       {
//         "internalType": "uint256",
//         "name": "likeCount",
//         "type": "uint256"
//       },
//       {
//         "internalType": "uint256",
//         "name": "collectCount",
//         "type": "uint256"
//       },
//       {
//         "internalType": "uint256",
//         "name": "commentCount",
//         "type": "uint256"
//       }
//     ],
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "inputs": [],
//     "name": "getAllForum",
//     "outputs": [
//       {
//         "components": [
//           {
//             "internalType": "uint256",
//             "name": "forumId",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "userId",
//             "type": "uint256"
//           },
//           {
//             "internalType": "string",
//             "name": "title",
//             "type": "string"
//           },
//           {
//             "internalType": "string",
//             "name": "content",
//             "type": "string"
//           },
//           {
//             "internalType": "string[]",
//             "name": "imagesCID",
//             "type": "string[]"
//           },
//           {
//             "internalType": "uint256",
//             "name": "timeStamp",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "likeCount",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "collectCount",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "commentCount",
//             "type": "uint256"
//           }
//         ],
//         "internalType": "struct SocialNetwork.Forum[]",
//         "name": "",
//         "type": "tuple[]"
//       }
//     ],
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "inputs": [
//       {
//         "internalType": "uint256",
//         "name": "_forumId",
//         "type": "uint256"
//       }
//     ],
//     "name": "getCollectCount",
//     "outputs": [
//       {
//         "internalType": "uint256",
//         "name": "",
//         "type": "uint256"
//       }
//     ],
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "inputs": [
//       {
//         "internalType": "uint256",
//         "name": "_forumId",
//         "type": "uint256"
//       }
//     ],
//     "name": "getCommentCount",
//     "outputs": [
//       {
//         "internalType": "uint256",
//         "name": "",
//         "type": "uint256"
//       }
//     ],
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "inputs": [
//       {
//         "internalType": "uint256",
//         "name": "_userId",
//         "type": "uint256"
//       }
//     ],
//     "name": "getForumByUser",
//     "outputs": [
//       {
//         "components": [
//           {
//             "internalType": "uint256",
//             "name": "forumId",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "userId",
//             "type": "uint256"
//           },
//           {
//             "internalType": "string",
//             "name": "title",
//             "type": "string"
//           },
//           {
//             "internalType": "string",
//             "name": "content",
//             "type": "string"
//           },
//           {
//             "internalType": "string[]",
//             "name": "imagesCID",
//             "type": "string[]"
//           },
//           {
//             "internalType": "uint256",
//             "name": "timeStamp",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "likeCount",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "collectCount",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "commentCount",
//             "type": "uint256"
//           }
//         ],
//         "internalType": "struct SocialNetwork.Forum[]",
//         "name": "",
//         "type": "tuple[]"
//       }
//     ],
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "inputs": [
//       {
//         "internalType": "uint256",
//         "name": "_forumId",
//         "type": "uint256"
//       }
//     ],
//     "name": "getForumComments",
//     "outputs": [
//       {
//         "components": [
//           {
//             "internalType": "uint256",
//             "name": "commentId",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "userId",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "forumId",
//             "type": "uint256"
//           },
//           {
//             "internalType": "string",
//             "name": "content",
//             "type": "string"
//           },
//           {
//             "internalType": "uint256",
//             "name": "timeStamp",
//             "type": "uint256"
//           }
//         ],
//         "internalType": "struct SocialNetwork.Comment[]",
//         "name": "",
//         "type": "tuple[]"
//       }
//     ],
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "inputs": [
//       {
//         "internalType": "uint256",
//         "name": "_forumId",
//         "type": "uint256"
//       }
//     ],
//     "name": "getForumInfo",
//     "outputs": [
//       {
//         "components": [
//           {
//             "internalType": "uint256",
//             "name": "forumId",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "userId",
//             "type": "uint256"
//           },
//           {
//             "internalType": "string",
//             "name": "title",
//             "type": "string"
//           },
//           {
//             "internalType": "string",
//             "name": "content",
//             "type": "string"
//           },
//           {
//             "internalType": "string[]",
//             "name": "imagesCID",
//             "type": "string[]"
//           },
//           {
//             "internalType": "uint256",
//             "name": "timeStamp",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "likeCount",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "collectCount",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "commentCount",
//             "type": "uint256"
//           }
//         ],
//         "internalType": "struct SocialNetwork.Forum",
//         "name": "",
//         "type": "tuple"
//       }
//     ],
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "inputs": [
//       {
//         "internalType": "uint256",
//         "name": "_forumId",
//         "type": "uint256"
//       }
//     ],
//     "name": "getLikeCount",
//     "outputs": [
//       {
//         "internalType": "uint256",
//         "name": "",
//         "type": "uint256"
//       }
//     ],
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "inputs": [
//       {
//         "internalType": "uint256",
//         "name": "_userId",
//         "type": "uint256"
//       }
//     ],
//     "name": "getUserForumCount",
//     "outputs": [
//       {
//         "internalType": "uint256",
//         "name": "",
//         "type": "uint256"
//       }
//     ],
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "inputs": [
//       {
//         "internalType": "uint256",
//         "name": "_userId",
//         "type": "uint256"
//       }
//     ],
//     "name": "getUserInfo",
//     "outputs": [
//       {
//         "components": [
//           {
//             "internalType": "address",
//             "name": "userAddress",
//             "type": "address"
//           },
//           {
//             "internalType": "uint256",
//             "name": "userId",
//             "type": "uint256"
//           },
//           {
//             "internalType": "string",
//             "name": "nickname",
//             "type": "string"
//           },
//           {
//             "internalType": "string",
//             "name": "avatarCID",
//             "type": "string"
//           }
//         ],
//         "internalType": "struct SocialNetwork.UserInfo",
//         "name": "",
//         "type": "tuple"
//       }
//     ],
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "inputs": [],
//     "name": "isRegister",
//     "outputs": [
//       {
//         "internalType": "bool",
//         "name": "",
//         "type": "bool"
//       }
//     ],
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "inputs": [
//       {
//         "internalType": "uint256",
//         "name": "",
//         "type": "uint256"
//       }
//     ],
//     "name": "UserForumCount",
//     "outputs": [
//       {
//         "internalType": "uint256",
//         "name": "",
//         "type": "uint256"
//       }
//     ],
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "inputs": [
//       {
//         "internalType": "uint256",
//         "name": "",
//         "type": "uint256"
//       }
//     ],
//     "name": "UserMap",
//     "outputs": [
//       {
//         "internalType": "address",
//         "name": "userAddress",
//         "type": "address"
//       },
//       {
//         "internalType": "uint256",
//         "name": "userId",
//         "type": "uint256"
//       },
//       {
//         "internalType": "string",
//         "name": "nickname",
//         "type": "string"
//       },
//       {
//         "internalType": "string",
//         "name": "avatarCID",
//         "type": "string"
//       }
//     ],
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "inputs": [
//       {
//         "internalType": "uint256",
//         "name": "",
//         "type": "uint256"
//       }
//     ],
//     "name": "users",
//     "outputs": [
//       {
//         "internalType": "address",
//         "name": "userAddress",
//         "type": "address"
//       },
//       {
//         "internalType": "uint256",
//         "name": "userId",
//         "type": "uint256"
//       },
//       {
//         "internalType": "string",
//         "name": "nickname",
//         "type": "string"
//       },
//       {
//         "internalType": "string",
//         "name": "avatarCID",
//         "type": "string"
//       }
//     ],
//     "stateMutability": "view",
//     "type": "function"
//   }
// ]
const groupMsg = [
  {
    logo: '	https://jxxt-1257689580.cos.ap-chengdu.myqcloud.com/e685acf36f7ca13d0a8fbe05f0b21aef.png?imageMogr2/crop/196x196/gravity/center',
    name: '用户圈子',
    title: '一起打磨出闪闪发光的技术宝石其实就是闪闪发光其实就是闪闪发光其实就是闪闪发光其实就是闪闪发光！',
    memeber: 123,
    joined: '公开加入',
    way: '1',
    join: '0',
  },
  {
    logo: 'https://jxxt-1257689580.cos.ap-chengdu.myqcloud.com/b0871f7c37be55ea9ce2806eea18486f.jpg?imageMogr2/crop/196x196/gravity/center',
    name: '用户圈子',
    title: '一起打磨出闪闪发光的技术宝石其实就是闪闪发光其实就是闪闪发光其实就是闪闪发光其实就是闪闪发光！',
    memeber: 123,
    joined: '申请加入',
    way: '2',
    join: '1',
  },
  {
    logo: '	https://jxxt-1257689580.cos.ap-chengdu.myqcloud.com/e685acf36f7ca13d0a8fbe05f0b21aef.png?imageMogr2/crop/196x196/gravity/center',
    name: '用户圈子',
    title: '一起打磨出闪闪发光的技术宝石其实就是闪闪发光其实就是闪闪发光其实就是闪闪发光其实就是闪闪发光！',
    memeber: 123,
    joined: '公开加入',
    way: '1',
    join: '0',
  },
  {
    logo: '	https://jxxt-1257689580.cos.ap-chengdu.myqcloud.com/e685acf36f7ca13d0a8fbe05f0b21aef.png?imageMogr2/crop/196x196/gravity/center',
    name: '用户圈子',
    title: '一起打磨出闪闪发光的技术宝石其实就是闪闪发光其实就是闪闪发光其实就是闪闪发光其实就是闪闪发光！',
    memeber: 123,
    joined: '公开加入',
    way: '1',
    join: '1',
  },
  {
    logo: '	https://jxxt-1257689580.cos.ap-chengdu.myqcloud.com/b0871f7c37be55ea9ce2806eea18486f.jpg?imageMogr2/crop/196x196/gravity/center',
    name: '用户圈子',
    title: '一起打磨出闪闪发光的技术宝石其实就是闪闪发光其实就是闪闪发光其实就是闪闪发光其实就是闪闪发光！',
    memeber: 123,
    joined: '公开加入',
    way: '1',
    join: '0',
  },
  {
    logo: '	https://sad.apps.vip/public/uploads/attach/2021/05/20/60a5ffcaa2eca.png_196x196m1',
    name: '用户圈子',
    title: '一起打磨出闪闪发光的技术宝石其实就是闪闪发光其实就是闪闪发光其实就是闪闪发光其实就是闪闪发光！',
    memeber: 123,
    joined: '申请加入',
    way: '2',
    join: '0',
  },
  {
    logo: '	https://jxxt-1257689580.cos.ap-chengdu.myqcloud.com/e685acf36f7ca13d0a8fbe05f0b21aef.png?imageMogr2/crop/196x196/gravity/center',
    name: '用户圈子',
    title: '一起打磨出闪闪发光的技术宝石其实就是闪闪发光其实就是闪闪发光其实就是闪闪发光其实就是闪闪发光！',
    memeber: 123,
    joined: '公开加入',
    way: '1',
    join: '0',
  },
  {
    logo: '	https://jxxt-1257689580.cos.ap-chengdu.myqcloud.com/e685acf36f7ca13d0a8fbe05f0b21aef.png?imageMogr2/crop/196x196/gravity/center',
    name: '用户圈子',
    title: '一起打磨出闪闪发光的技术宝石其实就是闪闪发光其实就是闪闪发光其实就是闪闪发光其实就是闪闪发光！',
    memeber: 123,
    joined: '公开加入',
    way: '1',
    join: '0',
  },
  {
    logo: '	https://jxxt-1257689580.cos.ap-chengdu.myqcloud.com/e685acf36f7ca13d0a8fbe05f0b21aef.png?imageMogr2/crop/196x196/gravity/center',
    name: '用户圈子',
    title: '一起打磨出闪闪发光的技术宝石其实就是闪闪发光其实就是闪闪发光其实就是闪闪发光其实就是闪闪发光！',
    memeber: 123,
    joined: '公开加入',
    way: '1',
    join: '0',
  },
  {
    logo: '	https://jxxt-1257689580.cos.ap-chengdu.myqcloud.com/e685acf36f7ca13d0a8fbe05f0b21aef.png?imageMogr2/crop/196x196/gravity/center',
    name: '用户圈子',
    title: '一起打磨出闪闪发光的技术宝石其实就是闪闪发光其实就是闪闪发光其实就是闪闪发光其实就是闪闪发光！',
    memeber: 123,
    joined: '申请加入',
    way: '2',
    join: '0',
  },
  {
    logo: '	https://jxxt-1257689580.cos.ap-chengdu.myqcloud.com/e685acf36f7ca13d0a8fbe05f0b21aef.png?imageMogr2/crop/196x196/gravity/center',
    name: '用户圈子',
    title: '一起打磨出闪闪发光的技术宝石其实就是闪闪发光其实就是闪闪发光其实就是闪闪发光其实就是闪闪发光！',
    memeber: 123,
    joined: '公开加入',
    way: '1',
    join: '0',
  },
  {
    logo: '	https://jxxt-1257689580.cos.ap-chengdu.myqcloud.com/e685acf36f7ca13d0a8fbe05f0b21aef.png?imageMogr2/crop/196x196/gravity/center',
    name: '用户圈子',
    title: '一起打磨出闪闪发光的技术宝石其实就是闪闪发光其实就是闪闪发光其实就是闪闪发光其实就是闪闪发光！',
    memeber: 123,
    joined: '公开加入',
    way: '1',
    join: '0',
  },
];
const users = [
  {
    id:1,
    nickname: 'luckysheep',
    avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
    backgroundImg: 'https://fuss10.elemecdn.com/3/28/bbf893f792f03a54408b3b7a7ebf0jpeg.jpeg',
    description:'要做六边形战士！',
    createTime: '2024-01-08 10:19:43',
    followNum:88,
    followIds:[],
    fanNum:88,
    fanIds:[],
    forumNum:199,
    forumIds:[],
    ip_home: {
      region: '河南',
    },
    loveNum:2,
    likeIds: [1,2],
    collectNum:1,
    collectIds:[1]
  },
  {
    id:2,
    nickname: '冬眠星星',
    avatar: 'https://xsgames.co/randomusers/avatar.php?g=pixel&key=2',
    backgroundImg:'https://fuss10.elemecdn.com/9/bb/e27858e973f5d7d3904835f46abbdjpeg.jpeg',
    description:'想要快乐！',
    createTime: '2024-01-08 10:19:43',
    followNum:100,
    followIds:[],
    fanNum:100,
    fanIds:[],
    forumNum:100,
    forumIds:[],
    ip_home: {
      region: '河南',
    },
    loveNum:1,
    likeIds: [0],
    collectNum:1,
    collectIds:[0]
  },
  {
    id:3,
    nickname: '蜂蜜罐罐',
    avatar: 'https://xsgames.co/randomusers/avatar.php?g=pixel&key=2',
    backgroundImg:'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg',
    description:'兔比南波万',
    createTime: '2024-01-08 10:19:43',
    followNum:10,
    followIds:[],
    fanNum:18,
    fanIds:[],
    forumNum:100,
    forumIds:[],
    ip_home: {
      region: '河南',
    },
    loveNum:1,
    likeIds: [0],
    collectNum:1,
    collectIds:[0]
  },
  {
    id:4,
    nickname: 'jack',
    avatar: 'https://static.juzicon.com/avatars/avatar-200602130320-HMR2.jpeg?x-oss-process=image/resize,w_100',
    backgroundImg:'https://fuss10.elemecdn.com/0/6f/e35ff375812e6b0020b6b4e8f9583jpeg.jpeg',
    description:'兔比南波万',
    createTime: '2024-01-08 10:19:43',
    followNum:10,
    followIds:[],
    fanNum:18,
    fanIds:[],
    forumNum:100,
    forumIds:[],
    ip_home: {
      region: '河南',
    },
    loveNum:1,
    likeIds: [0],
    collectNum:1,
    collectIds:[0]
  },
]
const topicData = [
  {
    title: '#封神',
    description: '过去 2 天有 94 人讨论'
  },
  {
    title: '#北林雪王',
    description: '过去 2 天有 37 人讨论'
  },
  {
    title: '#周杰伦',
    description: '过去 2 天有 33 人讨论'
  },
  {
    title: '#圣诞节',
    description: '过去 2 天有 11 人讨论'
  },
];
const comCards = {
  list: [
    {
      id:1,
      user: {
        id:4,
        nickname: 'jack',
        avatar: 'https://static.juzicon.com/avatars/avatar-200602130320-HMR2.jpeg?x-oss-process=image/resize,w_100',
        ip_home: {
          region: '未知',
        },
      },
      createTime: '2022-12-12 12:12:12',
      content:
        '缘生缘灭，缘起缘落，我在看别人的故事，别人何尝不是在看我的故事?别人在演绎人生，我又何尝不是在这场戏里?谁的眼神沧桑了谁?我的眼神，只是沧桑了自己',
      title: '缘生缘灭，缘起缘落',
      loveCount: '100',
      collectCount: '100',
      commentCount: '100',
      imgs: [{
        img:'https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png'
      }],
      tags: [
        {
          "id": 1,
          "tagName": "人生"
        },
        {
          "id": 2,
          "tagName": "缘分"
        }
      ],
    },
    {
      id:2,
      user: {
        id:1,
        nickname: 'luckysheep',
        avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
        ip_home: {
          region: '未知',
        },
      },
      createTime: '2022-12-12 12:12:12',
      content:
        '今天来跟大家分享几张好看的图片！',
      title: '图片分享',
      loveCount: '100',
      collectCount: '100',
      commentCount: '100',
      imgs: [
        {
          img:'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg'
        },
        {
          img:'https://fuss10.elemecdn.com/2/11/6535bcfb26e4c79b48ddde44f4b6fjpeg.jpeg'
        },
        {
          img:'https://fuss10.elemecdn.com/3/28/bbf893f792f03a54408b3b7a7ebf0jpeg.jpeg'
        }],
      tags: [
        {
          "id": 3,
          "tagName": "图片分享"
        }
      ],
    },
    {
      id:3,
      user: {
        nickname: '摆烂ing',
        avatar: 'https://xsgames.co/randomusers/avatar.php?g=pixel&key=1',
        ip_home: {
          region: '未知',
        },
      },
      createTime: '2022-12-12 12:12:12',
      content:
        '经历了连续的几天的服务器震荡。目前我们已经基本稳定了服务器的表现。接下来应该会更加稳定。',
      title: '经历了连续的几天的服务器震荡',
      loveCount: '100',
      collectCount: '100',
      commentCount: '100',
      imgs: [],
      tags: [
        {
          "id": 4,
          "tagName": "服务器"
        },
        {
          "id": 5,
          "tagName": "稳定"
        }
      ],
    },
    {
      id:4,
      user: {
        nickname: '摆烂ing',
        avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
        ip_home: {
          region: '未知',
        },
      },
      createTime: '2022-12-12 12:12:12',
      content:
        '经历了连续的几天的服务器震荡。目前我们已经基本稳定了服务器的表现。接下来应该会更加稳定。阿皮有话说：由…',
      title: '经历了连续的几天的服务器震荡。',
      loveCount: '100',
      collectCount: '100',
      commentCount: '100',
      imgs: [],
    },
  ],
};

export { comCards, groupMsg, users, topicData, socialContractAddress, socialContractABI };
