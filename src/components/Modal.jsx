import '@styles/modal.css';

export default function Modal({isOpened, continueSession, logout, title, message}) {
    // only render when modal is confirmed to be opened
    if(!isOpened){
        return;
    }

    return (
        <div className='overlay' onClick={(e) => e.stopPropagation()} onMouseMove={(e) => e.stopPropagation()}>
            <div className='modal'>
                <h1 className='title'>{title}</h1>
                <p className='message'>{message}</p>
                <div className='authBtnGrp'>
                    <button className='authBtn stay' onClick={continueSession}>Do Not Log Out</button>
                    <button className='authBtn logout' onClick={logout}>Log out now</button>
                </div>
            </div>
        </div>
    )
}