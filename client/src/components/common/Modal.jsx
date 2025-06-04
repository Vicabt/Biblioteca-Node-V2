import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Dialog, Transition } from '@headlessui/react';
import { HiX } from 'react-icons/hi';
import Button from './Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  description,
  children, 
  footerContent,
  size = 'md', 
  closeOnClickOutside = true 
}) => {
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-full'
  };
  
  const modalContent = (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="fixed inset-0 z-50 overflow-y-auto" 
        onClose={closeOnClickOutside ? onClose : () => {}}
      >
        <div className="min-h-screen px-4 text-center">
          {/* This trick centers the modal */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>
          
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel
              className={`z-[9999] pointer-events-auto inline-block w-full ${sizeClasses[size]} p-6 my-8 overflow-hidden text-left align-middle bg-white shadow-xl rounded-2xl`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  {title && (
                    <Dialog.Title as="h3" className="text-lg font-semibold text-slate-900">
                      {title}
                    </Dialog.Title>
                  )}
                  
                  {description && (
                    <Dialog.Description className="mt-1 text-sm text-slate-500">
                      {description}
                    </Dialog.Description>
                  )}
                </div>
                
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 focus:outline-none"
                  onClick={onClose}
                >
                  <HiX className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-2">
                {children}
              </div>

              {footerContent && (
                <div className="mt-6 pt-4 border-t border-slate-200">
                  {footerContent}
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  description: PropTypes.node,
  children: PropTypes.node.isRequired,
    footerContent: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', 'full']),
  closeOnClickOutside: PropTypes.bool,
};

export default Modal;