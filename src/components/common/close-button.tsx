'use client';

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-1/3">
        <h2 className="text-xl font-bold mb-4">
          Are you sure you want to cancel the quiz?
        </h2>
        <p className="mb-4">Your progress will be lost.</p>
        <div className="flex justify-end space-x-4">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded"
            onClick={onCancel}
          >
            No, Continue
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={onConfirm}
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
