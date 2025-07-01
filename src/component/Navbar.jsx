const Navbar = () => {
  return (
    <div className="bg-[#E22B2B] h-16 flex items-center justify-between position-fixed top-2 left-2 right-2 ">
      <div className="flex items-center  ">
        <img src="/logo.png" alt="Bitcoin Logo" className="w-28 h-28 " />
        <h1 className="text-white text-4xl font-bold">Bitcoin GPT</h1>
      </div>
    </div>
  );
};

export default Navbar;
