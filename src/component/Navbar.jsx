const Navbar = () => {
  return (
    // <div className="bg-[#c7243b] h-16 flex items-center justify-between px-2">
    <div className="bg-gradient-to-r from-orange-400 to-yellow-400 h-16 flex items-center justify-between px-2">
      <div className="flex items-center">
        <img
          src="/logo.png"
          alt="Bitcoin Logo"
          className="w-16 h-16 md:w-28 md:h-28"
        />
        {/* <h1 className="text-white text-2xl md:text-4xl font-bold"> */}
          <h1 className="text-[#1f2630] text-2xl md:text-4xl font-bold">
          Bitcoin GPT
        </h1>
      </div>
    </div>
  );
};

export default Navbar;
