import { useEffect, useMemo, useState } from "react";

import GlobalModal from "../../../shared/components/GlobalModal";

interface Product {
  product_id: number;
  product_name: string;
  product_price: number;
  created_at?: string;
}

interface Props {
  isOpen: boolean;
  isClose: () => void;
  mode: "add" | "edit";
  product?: Product | null;
  loading?: boolean;
  initialProductName?: string;
  onSubmit: (payload: {
    product_name: string;
    product_price: number;
  }) => Promise<any>;
}

const PRODUCT_SUGGESTIONS = [
  "KOPIKO BROWN 3 IN 1",
  "KOPIKO BLANCA",
  "KOPIKO BLACK",
  "NESCAFE ORIGINAL 3 IN 1",
  "NESCAFE CREAMY WHITE",
  "NESCAFE CLASSIC",
  "GREAT TASTE WHITE",
  "GREAT TASTE CHOCO",
  "GREAT TASTE ORIGINAL",
  "MILO SACHET",
  "BEAR BRAND SACHET",
  "ENERGEN CHOCOLATE",
  "ENERGEN VANILLA",
  "ENERGEN CHAMPION",
  "COBRA ENERGY DRINK",
  "STING ENERGY DRINK",
  "RED BULL",
  "EXTRA JOSS",
  "C2 APPLE",
  "C2 LEMON",
  "C2 GREEN TEA",
  "COCA-COLA MISMO",
  "SPRITE MISMO",
  "ROYAL MISMO",
  "MOUNTAIN DEW",
  "PEPSI",
  "7 UP",
  "MIRINDA",
  "ZESTO ORANGE",
  "ZESTO GRAPE",
  "TANG ORANGE",
  "TANG GRAPE",
  "TANG MANGO",
  "LUCKY ME BEEF",
  "LUCKY ME CHICKEN",
  "LUCKY ME BULALO",
  "LUCKY ME LOMI",
  "LUCKY ME PANCIT CANTON ORIGINAL",
  "LUCKY ME PANCIT CANTON CHILIMANSI",
  "LUCKY ME PANCIT CANTON KALAMANSI",
  "LUCKY ME PANCIT CANTON SWEET AND SPICY",
  "LUCKY ME PANCIT CANTON EXTRA HOT",
  "PAYLESS XTRA BIG BEEF",
  "PAYLESS XTRA BIG CHICKEN",
  "NISSIN CUP NOODLES",
  "555 SARDINES",
  "MEGA SARDINES",
  "LIGO SARDINES",
  "YOUNGSTOWN SARDINES",
  "ARGENTINA CORNED BEEF",
  "PUREFOODS CORNED BEEF",
  "CDO CORNED BEEF",
  "CENTURY TUNA",
  "555 TUNA",
  "MEGA TUNA",
  "SPAM",
  "ARGENTINA MEATLOAF",
  "RENO LIVER SPREAD",
  "SKYFLAKES",
  "FITA",
  "HANSEL MOCHA",
  "HANSEL MILK",
  "CREAM-O CHOCOLATE",
  "REBISCO CRACKERS",
  "REBISCO SANDWICH",
  "PIATTOS CHEESE",
  "PIATTOS SOUR CREAM",
  "NOVA COUNTRY CHEDDAR",
  "CHEEZY RED",
  "CHEEZY GREEN",
  "BOY BAWANG GARLIC",
  "BOY BAWANG CORNICK",
  "OISHI PRAWN CRACKERS",
  "CLOVER CHIPS",
  "CHIPPY BBQ",
  "VCUT",
  "NAGARAYA CRACKER NUTS",
  "MOBY CHOCOLATE",
  "MOBY CARAMEL",
  "MARLBORO RED",
  "MARLBORO GOLD",
  "MARLBORO CRAFTED",
  "FORTUNE TRIBAL RED",
  "FORTUNE TRIBAL BLUE",
  "WINSTON RED",
  "CAMEL YELLOW",
  "HOPE MENTHOL",
  "CHESTERFIELD",
  "MIGHTY BLUE",
  "MIGHTY RED",
  "SAFEGUARD WHITE",
  "SAFEGUARD BEIGE",
  "PALMOLIVE GREEN",
  "PALMOLIVE PINK",
  "SURF POWDER",
  "TIDE POWDER",
  "ARIEL POWDER",
  "DOWNY SUNRISE FRESH",
  "CHAMPION DETERGENT",
  "JOY DISHWASHING",
  "ZONROX BLEACH",
  "CALLA FABCON",
  "COLGATE REGULAR",
  "COLGATE COOL MINT",
  "CLOSE UP RED",
  "HEAD AND SHOULDERS",
  "CREAM SILK PINK",
  "PANTENE SHAMPOO",
  "GARDENIA CLASSIC",
  "MONAY",
  "PANDESAL",
  "EGG",
  "RICE 1KG",
  "RICE 5KG",
  "SUGAR 1KG",
  "BROWN SUGAR",
  "SALT",
  "SOY SAUCE",
  "VINEGAR",
  "COOKING OIL",
  "DATU PUTI SOY SAUCE",
  "DATU PUTI VINEGAR",
  "SILVER SWAN SOY SAUCE",
  "UFC BANANA KETCHUP",
  "MANG TOMAS",
  "ALASKA EVAPORADA",
  "ALASKA CONDENSADA",
  "ANGEL CONDENSED",
  "NESTLE FRESH MILK",
  "ALASKA FRESH MILK",
  "YAKULT",
  "HOTDOG",
  "LONGGANISA",
  "TOCINO",
  "PUREFOODS HOTDOG",
  "VIRGINIA HOTDOG",
  "CHICKEN",
  "PORK",
  "BEEF",
  "ICE CANDY",
  "MINERAL WATER",
  "WILKINS WATER",
  "ABSOLUTE WATER",
  "VITAMILK",
  "OATIES",
  "FRESCA TUNA",
  "KERATIN PLUS",
  "BIODERM SOAP",
  "MASTER SARDINES",
  "BINGO ORANGE",
  "BINGO CHOCOLATE",
  "PRESTO PEANUT BUTTER",
  "PRESTO CHOCOLATE",
  "HAPPY PEANUTS",
  "MILO DRINK",
  "RC COLA",
  "LIPTON ICED TEA",
];

export default function ProductModal({
  isOpen,
  isClose,
  mode,
  product,
  loading,
  initialProductName,
  onSubmit,
}: Props) {
  const [animate, setAnimate] = useState(false);

  const [form, setForm] = useState({
    product_name: "",
    price: "",
  });

  const [showSuggestions, setShowSuggestions] =
    useState(false);

  const [globalModal, setGlobalModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimate(true), 10);

      if (mode === "edit" && product) {
        setForm({
          product_name: product.product_name || "",
          price: String(product.product_price || ""),
        });
      }

      if (mode === "add") {
        setForm({
          product_name: initialProductName || "",
          price: "",
        });
      }
    } else {
      setAnimate(false);
      setShowSuggestions(false);
    }
  }, [isOpen, mode, product]);

  const filteredSuggestions = useMemo(() => {
    if (!form.product_name.trim()) {
      return PRODUCT_SUGGESTIONS.slice(0, 15);
    }

    return PRODUCT_SUGGESTIONS.filter((item) =>
      item
        .toLowerCase()
        .includes(form.product_name.toLowerCase())
    ).slice(0, 15);
  }, [form.product_name]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.product_name.trim()) {
      setGlobalModal({
        isOpen: true,
        title: "Missing Product",
        message: "Product name is required",
        type: "error",
      });

      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      setGlobalModal({
        isOpen: true,
        title: "Invalid Price",
        message: "Valid price is required.",
        type: "error",
      });

      return;
    }

    const res = await onSubmit({
      product_name: form.product_name.trim(),
      product_price: Number(form.price),
    });

    if (!res?.ok) {
      setGlobalModal({
        isOpen: true,
        title: "Error",
        message: res?.message || "Something went wrong",
        type: "error",
      });
      return;
    }

    if (res?.ok) {
      isClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-300"
      onClick={isClose}
    >
      <div
        className={`fixed top-0 left-0 w-full bg-white rounded-b-2xl shadow-xl transform transition-transform duration-300 ease-out ${
          animate ? "translate-y-0" : "-translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[90vh] overflow-y-auto p-6 space-y-6">
          <h2 className="text-lg font-semibold text-[#1E3A8A]">
            {mode === "add"
              ? "Add Product"
              : "Edit Product"}
          </h2>

          <div className="space-y-4">
            {/* Product Name */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">
                Product Name
              </label>

              <input
                value={form.product_name}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) =>
                  handleChange(
                    "product_name",
                    e.target.value
                  )
                }
                placeholder="Search or type product..."
                className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
              />

              {/* Suggestions */}
              {showSuggestions && (
                <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                  {filteredSuggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          product_name: item,
                        }));

                        setShowSuggestions(false);
                      }}
                      className="flex w-full items-center justify-between border-b border-gray-100 px-3 py-3 text-left text-sm transition hover:bg-blue-50"
                    >
                      <span>{item}</span>

                      <span className="text-xs text-gray-400">
                        Suggested
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">
                Price
              </label>

              <input
                type="number"
                value={form.price}
                onChange={(e) =>
                  handleChange("price", e.target.value)
                }
                placeholder="Example: 25"
                className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={isClose}
              disabled={loading}
              className="w-1/2 rounded-xl border border-gray-300 py-3 text-sm disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-1/2 rounded-xl bg-[#16A34A] py-3 text-sm text-white disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : mode === "add"
                ? "Save Product"
                : "Update Product"}
            </button>
          </div>
        </div>
      </div>

      <GlobalModal
        isOpen={globalModal.isOpen}
        title={globalModal.title}
        message={globalModal.message}
        type={globalModal.type as any}
        onClose={() =>
          setGlobalModal({
            ...globalModal,
            isOpen: false,
          })
        }
      />
    </div>
  );
}