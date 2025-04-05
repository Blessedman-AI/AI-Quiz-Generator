const GeneratingModal = ({
  isGenerating,
  message = 'Your quiz is being created.',
}) => {
  if (!isGenerating) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-gray-500/80 flex items-center justify-center
    transition-opacity duration-400  z-50"
    >
      <div className="bg-white rounded-lg p-6 flex flex-col items-center max-w-sm w-full">
        <h2 className="text-xl text-gray-700 font-medium mb-4">
          Generating...
        </h2>

        <div className="w-14 h-14 rounded-full bg-blue-500 mb-4 animate-[dramaticPulse_1s_infinite]"></div>

        <p className="text-gray-500 text-center">{message}</p>
      </div>
    </div>
  );
};

export default GeneratingModal;
