interface ConvertButtonProps {
  onConvert: () => void;
  disabled?: boolean;
}

export default function ConvertButton({
  onConvert,
  disabled = false,
}: ConvertButtonProps) {
  return (
    <button
      type="button"
      onClick={onConvert}
      disabled={disabled}
      className="mt-6 rounded-lg bg-black px-5 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      Convert
    </button>
  );
}