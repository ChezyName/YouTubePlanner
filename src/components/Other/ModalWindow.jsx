import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function ModalWindow({title="Exit",body="Exit Application?",yes="Confirm",onConfirmPressed,onClosed,setShow}) {
  return (
    <>
      <Modal
        show={setShow}
        onHide={onClosed}
        backdrop="static"
        keyboard={false}
        centered={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{body}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClosed}>
            Close
          </Button>
          <Button variant="primary" onClick={onConfirmPressed}>{yes}</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalWindow;