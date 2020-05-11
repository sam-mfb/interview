import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
// withModal is a higher order component that makes a component modal
import { withModal, ConfirmWithModal } from "./Basic"
import IconButton from "./IconButton"
import "../styles/PostEditor.scss"
// postService handles constructing and making API calls
import postService from "../services/posts"

const PostEditor = ({
  onSubmit, //function to inform parent component submission is complete
  onClose, //function to inform parent component user is done with this component
  currentUser, //logged in user of the app
  postId,
  subject,
  content
}) => {
  const [subjectState, setSubject] = useState(subject.value)
  const [contentState, setContent] = useState(content.value)
  const [showConfirmWithModal, setShowConfirmWithModal] = useState(false)
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    setShowError(false)
  }, [subjectState, contentState])

  const compose = (...fns) => arg => fns.reduce((x, f) => f(x), arg)

  const notBlank = str => (str.replace(/\s/g, "").length ? true : false)

  const setIsEdit = values => {
    return {
      ...values,
      isEdit: values.postId
    }
  }

  const addAuthor = author => values => {
    return {
      ...values,
      author: author
    }
  }

  const sendPost = values => {
    const post = {
      access: values.access,
      subject: values.subject,
      content: values.content,
      author: values.author
    }
    if (!values.isEdit) return postService.addPost(post)
    else return postService.editPost(values.postId, post)
  }

  const handleFormSubmit = event => {
    event.preventDefault()
    const values = {
      postId,
      content: contentState,
      subject: subjectState
    }

    const prepAndSendContent = compose(
      setIsEdit,
      addAuthor(currentUser),
      sendPost
    )

    if (notBlank(subjectState) && notBlank(contentState)) {
      prepAndSendContent(values)
        .then(onSubmit)
        .then(onClose)
        .catch(err => console.log("Error Sending Content:", err))
    } else setShowError(true)
  }

  const handleCloseAttempt = () => {
    if (subjectState === subject.value && contentState === content.value)
      onClose()
    else setShowConfirmWithModal(true)
  }

  const closeWarning =
    "If you close this window all your additions " +
    "and edits will be lost.  Are you sure you want to close it? " +
    "Click cancel if you would like to return to editing."

  return (
    <div className={"post-editor-container"}>
      <form>
        <div className="post-editor-controls">
          <IconButton onClick={handleCloseAttempt} icon="close" small={true} />
        </div>
        <div className="post-editor-subject">
          <input
            type="text"
            id="subject"
            name="subject"
            value={subjectState}
            readOnly={!subject.canEdit}
            required
            placeholder=" "
            pattern="[\s\S]*\S[\s\S]*"
            onChange={e => setSubject(e.target.value)}
          />
          <label htmlFor="subject">Subject</label>
          <div
            className="form-error"
            style={
              showError && !notBlank(subjectState) ? { display: "block" } : {}
            }
          >
            The subject line cannot be blank
          </div>
        </div>

        <div className="post-editor-content">
          <textarea
            id="content"
            name="content"
            required
            placeholder=" "
            defaultValue={contentState}
            onChange={e => setContent(e.target.value)}
          ></textarea>
          <label htmlFor="content">Type your message</label>
          <div
            className="form-error"
            style={
              showError && !notBlank(contentState) ? { display: "block" } : {}
            }
          >
            The post cannot be blank
          </div>
        </div>
        <div className="post-editor-submit">
          <input
            type="submit"
            value="Post Message"
            onClick={handleFormSubmit}
          />
        </div>
      </form>
      {showConfirmWithModal && (
        <ConfirmWithModal
          warning={closeWarning}
          onConfirm={onClose}
          onCancel={() => setShowConfirmWithModal(false)}
        />
      )}
    </div>
  )
}

PostEditor.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  currentUser: PropTypes.string.isRequired,
  postId: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  subject: PropTypes.object,
  content: PropTypes.object
}

PostEditor.defaultProps = {
  postId: false,
  subject: {
    value: "",
    canEdit: true
  },
  content: {
    value: "",
    canEdit: true
  }
}

const PostEditorWithModal = withModal(PostEditor)

export { PostEditor, PostEditorWithModal }
