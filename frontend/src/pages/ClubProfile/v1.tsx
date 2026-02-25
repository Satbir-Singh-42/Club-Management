"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";

export default function ClubForm() {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload an image less than 5MB");
    }
  };

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload an image less than 5MB");
    }
  };

  const removeLogoPreview = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const removeBannerPreview = () => {
    setBannerFile(null);
    setBannerPreview(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
      <Card className="bg-white shadow-md">
        <CardContent className="p-6">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="club-name" className="text-gray-600">
                  SOCIETY/CLUB&apos;S NAME
                </Label>
                <Input
                  id="club-name"
                  placeholder="Enter society/club's name"
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="advisor-name" className="text-gray-600">
                  FACULTY ADVISOR&apos;S NAME
                </Label>
                <Input
                  id="advisor-name"
                  placeholder="Enter faculty advisor's name"
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="advisor-contact" className="text-gray-600">
                  FACULTY ADVISOR&apos;S CONTACT
                </Label>
                <Input
                  id="advisor-contact"
                  type="tel"
                  placeholder="Enter faculty advisor's contact"
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="convener-name" className="text-gray-600">
                  CONVENER&apos;S NAME
                </Label>
                <Input
                  id="convener-name"
                  placeholder="Enter convener's name"
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="convener-contact" className="text-gray-600">
                  CONVENER&apos;S CONTACT
                </Label>
                <Input
                  id="convener-contact"
                  type="tel"
                  placeholder="Enter convener's contact"
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="club-email" className="text-gray-600">
                  CLUB/SOCIETY&apos;S EMAIL
                </Label>
                <Input
                  id="club-email"
                  type="email"
                  placeholder="Enter club/society's email"
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-gray-600">
                  WEBSITE LINK
                </Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="Enter website URL"
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-gray-600">
                  INSTAGRAM LINK
                </Label>
                <Input
                  id="instagram"
                  type="url"
                  placeholder="Enter Instagram profile URL"
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-gray-600">
                  LINKEDIN LINK
                </Label>
                <Input
                  id="linkedin"
                  type="url"
                  placeholder="Enter LinkedIn profile URL"
                  className="bg-gray-50"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-600">
                  SOCIETY/CLUB&apos;S LOGO
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:border-blue-400 transition-colors bg-gray-50">
                  <input
                    type="file"
                    id="logo"
                    className="hidden"
                    accept=".png,.jpg,.jpeg"
                    onChange={handleLogoUpload}
                  />
                  {logoPreview ? (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeLogoPreview}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="logo"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-10 w-10 text-gray-400" />
                      <span className="text-sm text-center text-gray-500">
                        Drag and drop or click to choose
                      </span>
                      <span className="text-xs text-center text-gray-400">
                        360 x 360 .png or .jpeg 5 MB max
                      </span>
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-600">
                  SOCIETY/CLUB&apos;S BANNER
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:border-blue-400 transition-colors bg-gray-50">
                  <input
                    type="file"
                    id="banner"
                    className="hidden"
                    accept=".png,.jpg,.jpeg"
                    onChange={handleBannerUpload}
                  />
                  {bannerPreview ? (
                    <div className="relative w-full">
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        className="w-full aspect-video object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeBannerPreview}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="banner"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-10 w-10 text-gray-400" />
                      <span className="text-sm text-center text-gray-500">
                        Drag and drop or click to choose
                      </span>
                      <span className="text-xs text-center text-gray-400">
                        1024 x 768 .png or .jpeg 5 MB max
                      </span>
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="highlight1" className="text-gray-600">
                  HIGHLIGHT1
                </Label>
                <Input
                  id="highlight1"
                  placeholder="Enter highlight"
                  maxLength={100}
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="highlight2" className="text-gray-600">
                  HIGHLIGHT2
                </Label>
                <Input
                  id="highlight2"
                  placeholder="Enter highlight"
                  maxLength={100}
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="highlight3" className="text-gray-600">
                  HIGHLIGHT3
                </Label>
                <Input
                  id="highlight3"
                  placeholder="Enter highlight"
                  maxLength={100}
                  className="bg-gray-50"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 md:col-span-2">
              <Button
                type="submit"
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Save
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
