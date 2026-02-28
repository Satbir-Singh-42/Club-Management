"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar/Navbar"; // Navbar component
import { Upload, X } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

export default function ClubForm() {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [clubId, setClubId] = useState<number | null>(null);

  const emailRef = useRef<any>(null);
  const nameRef = useRef<any>(null);
  const acronymRef = useRef<any>(null);
  const taglineRef = useRef<any>(null);
  const descriptionRef = useRef<any>(null);
  const instagramUrlRef = useRef<any>(null);
  const passwordRef = useRef<any>(null);

  useEffect(() => {
    fillInitialData();
  }, []);

  const fillInitialData = async () => {
    try {
      const response: any = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setClubId(response.data.id);
      emailRef.current.value = response.data.email;
      nameRef.current.value = response.data.name;
      acronymRef.current.value = response.data.acronym;
      taglineRef.current.value = response.data.tagline;
      descriptionRef.current.value = response.data.description;
      instagramUrlRef.current.value = response.data.instagram_url;

      // set user details in state
    } catch (err: any) {
      console.log(`Failed to load user details:${err}`);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !emailRef.current ||
      !nameRef.current ||
      !acronymRef.current ||
      !passwordRef.current
    ) {
      alert("Please fill out all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("email", emailRef.current.value);
    formData.append("name", nameRef.current.value);
    formData.append("acronym", acronymRef.current.value);
    formData.append("tagline", taglineRef.current?.value || "");
    formData.append("description", descriptionRef.current?.value || "");
    formData.append("instagram_url", instagramUrlRef.current?.value || "");
    formData.append("password", passwordRef.current.value);

    if (logoFile) {
      formData.append("logo", logoFile); // Append the logo file
    }
    if (bannerFile) {
      formData.append("banner", bannerFile); // Append the banner file
    }

    try {
      const response = await fetch(`${API_BASE_URL}/clubs/${clubId}`, {
        method: "PATCH",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to submit the form.");
      }

      alert("Form submitted successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Error occurred while submitting the form.");
    }
  };

  const handleCancel = () => {
    // Reset the form or navigate away
    alert("Form submission has been canceled.");
  };

  return (
    <div className="ClubProfile">
      <Navbar />

      <div className="mt-8 w-full max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Club Information</h2>

        <Card>
          <CardContent className="p-6">
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              onSubmit={handleSubmit}>
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    ref={emailRef}
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    required
                    maxLength={255}
                    minLength={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    ref={nameRef}
                    id="name"
                    type="text"
                    placeholder="Enter club/society name"
                    required
                    maxLength={255}
                    minLength={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="acronym">Acronym *</Label>
                  <Input
                    ref={acronymRef}
                    id="acronym"
                    type="text"
                    placeholder="Enter acronym"
                    required
                    maxLength={10}
                    minLength={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    ref={taglineRef}
                    id="tagline"
                    type="text"
                    placeholder="Enter tagline"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    ref={descriptionRef}
                    id="description"
                    placeholder="Enter description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram_url">Instagram URL</Label>
                  <Input
                    ref={instagramUrlRef}
                    id="instagram_url"
                    type="url"
                    placeholder="Enter Instagram URL"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    ref={passwordRef}
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    required
                    maxLength={255}
                    minLength={8}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>SOCIETY/CLUB&apos;S LOGO</Label>
                  <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:border-blue-400 transition-colors bg-blue-50/50">
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
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="logo"
                        className="cursor-pointer flex flex-col items-center gap-2">
                        <Upload className="h-10 w-10 text-blue-500" />
                        <span className="text-sm text-center text-blue-600">
                          Drag and drop or click to choose
                        </span>
                        <span className="text-xs text-center text-blue-600">
                          360 x 360 .png or .jpeg 5 MB max
                        </span>
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>SOCIETY/CLUB&apos;S BANNER</Label>
                  <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:border-blue-400 transition-colors bg-blue-50/50">
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
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="banner"
                        className="cursor-pointer flex flex-col items-center gap-2">
                        <Upload className="h-10 w-10 text-blue-500" />
                        <span className="text-sm text-center text-blue-600">
                          Drag and drop or click to choose
                        </span>
                        <span className="text-xs text-center text-blue-600">
                          1024 x 768 .png or .jpeg 5 MB max
                        </span>
                      </label>
                    )}
                  </div>
                </div>
                {/* Buttons */}
                <div className="flex gap-8 md:col-span-2 mt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 h-12 text-lg">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white h-12 text-lg">
                    Save
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
