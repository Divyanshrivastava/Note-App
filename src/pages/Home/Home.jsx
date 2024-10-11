import React, { useEffect, useState } from "react";
import NoteCard from "../../components/Cards/NoteCard";
import Navbar from "../../components/Navbar/Navbar";
import { MdAdd } from 'react-icons/md';
import AddEditNote from "./AddEditNote";
import Modal from 'react-modal';
import { useNavigate } from "react-router-dom";
import axiosInstance from '../../utils/axiosInstance.js';
import Toast from '../../components/ToastMessage/Toast'
import EmptyCard from "../../components/EmptyCard/EmptyCard";
import AddNoteImg from "../../assets/addnote.svg"
import NoNoteImg from "../../assets/noNotes.svg"

function Home() {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [showToast, setShowToast] = useState({
    isShown: false,
    message: "",
    type: "add"
  })


  const [userInfo, setUserInfo] = useState(null);
  const [allNotes, setAllNotes] = useState([]);

  const [isSearch, setIsSearch] = useState(false);

  const navigate = useNavigate();

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({
      isShown: true,
      data: noteDetails,
      type: "edit",
    });
  };

  const showToastMessage = (message, type) => {
    setShowToast({
      isShown: true,
      message,
      type
    })
  }

  const handleCloseToast = () => {
    setShowToast({
      isShown: false,
      message: "",
    })
  }

  // get user info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  // get all notes
  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-all-notes");
      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again.");
    }
  };

  // Delete Note
  const deleteNote = async (data) => {

    const noteId = data._id
    try {
      const response = await axiosInstance.delete(`/delete-note/${noteId}`)

      if (response.data && !response.data.error) {
        showToastMessage("Note Deleted Successfully", "delete");
        getAllNotes();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        console.log("An unexpected error occurred. Please try again.");
      }
    }
  }

  //Search Note
  const onSearchNote = async (query) => {
    try {
      const response = await axiosInstance.get("/search-note",{params: {query},
    })
    if(response.data && response.data.notes){
      setIsSearch(true);
      setAllNotes(response.data.notes)
    }
    } catch (error) {
      console.log(error)
    }
  }

  // Pinned
  const updateIsPinned = async(noteData) => {
    const noteId = noteData._id;
    try {
      const response = await axiosInstance.put(`/update-note-pinned/${noteId}`, {
        isPinned: !noteData.isPinned
      });

      if (response.data && response.data.note) {
        showToastMessage("Note Updated Successfully");
        getAllNotes();
      }
    } catch (error) {
        console.log(error)
      }
  }

  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes()
  }

  useEffect(() => {
    getAllNotes();
    getUserInfo();
  }, []);

  return (
    <>
      <Navbar userInfo={userInfo} onSearchNote={onSearchNote } handleClearSearch={handleClearSearch} />
      <div className="container mx-auto">
        {allNotes.length > 0 ? (<div className="grid grid-cols-3 gap-4 mt-8">
          {allNotes.map((item) => (
            <NoteCard
              key={item._id}
              title={item.title}
              date={item.createdOn}
              content={item.content}
              tags={item.tags}
              isPinned={item.isPinned}
              onEdit={() => handleEdit(item)}  // Use 'onEdit' instead of 'isEdit'
              onDelete={() => deleteNote(item)}
              onPinNote={() => updateIsPinned(item)}
            />
          ))}
        </div>) : (
          <EmptyCard imgSrc={isSearch ? NoNoteImg : AddNoteImg} message={isSearch ? "Oops! No notes found" : "Start creating your first note! Click the 'Add' button to jot down your thoughts, ideas, and reminders. let's get started!"}/>
        )}
      </div>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-blue-500 hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModal({
            isShown: true,
            type: "add",
            data: null,
          });
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => setOpenAddEditModal({ isShown: false, type: "add", data: null })}  // Handle modal close
        appElement={document.getElementById("root")} // or '#app'
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel=""
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
      >
        <AddEditNote
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => setOpenAddEditModal({ isShown: false, type: "add", data: null })}
          getAllNotes={getAllNotes}
          showToastMessage={showToastMessage}
        />
      </Modal>

      <Toast 
        isShown = {showToast.isShown}
        message = {showToast.message}
        type = {showToast.type}
        onClose = {handleCloseToast}
      />
    </>
  );
}

export default Home;
