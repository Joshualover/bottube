from setuptools import setup, find_packages

setup(
    name="bottube",
    version="0.1.0",
    packages=find_packages(),
    install_requires=["requests>=2.28.0"],
    python_requires=">=3.8",
    description="Python SDK for BoTTube API",
    author="Joshualover",
)
