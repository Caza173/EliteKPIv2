interface TestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TestModal({ isOpen, onClose }: TestModalProps) {
  console.log('TestModal rendered with isOpen:', isOpen);
  
  if (!isOpen) {
    console.log('TestModal not open, returning null');
    return null;
  }

  console.log('TestModal is open, rendering test dialog');

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-semibold mb-4">Test Modal</h2>
        <p className="mb-4">This is a simple test modal to verify functionality.</p>
        <p className="mb-4 text-sm text-gray-600">If you can see this, the modal system is working!</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              console.log('Close button clicked');
              onClose();
            }}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}